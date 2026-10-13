import {
  KMA_AWS_MIN_URL,
  KMA_AWS_TIMEOUT_MS,
  buildAwsQuery,
  findNearbyStations,
  normalizeApiHubKey,
  parseAwsMinute,
} from './_lib/kmaAwsCore.js';
import {
  KMA_NCST_URL,
  KMA_TIMEOUT_MS,
  getKmaBaseTime,
  normalizeServiceKey,
  parseKmaObservation,
  toKmaGrid,
  type KmaObservation,
} from './_lib/kmaCore.js';
import { parsePlaceCoords } from './_lib/placeCore.js';
import { logServerError } from './_lib/serverLog.js';

/** HTTP 상태 코드 */
const STATUS_BAD_REQUEST = 400;
const STATUS_BAD_GATEWAY = 502;
const STATUS_SERVER_ERROR = 500;
/** 응답 항목 수 (기온·습도·풍속·강수 등 실황 항목이 8개) */
const KMA_ROWS = 10;
/** CDN 캐시 시간(초). 실황은 매시 갱신되므로 짧게 둔다 */
const CACHE_SECONDS = 120;

/** JSON 응답을 만든다. 성공일 때만 짧게 캐시한다. */
function json(body: unknown, status = 200): Response {
  const cache = status === 200 ? `public, s-maxage=${CACHE_SECONDS}` : 'no-store';
  return Response.json(body, { status, headers: { 'Cache-Control': cache } });
}

/** 기상청 초단기실황을 조회한다. 기온을 알 수 없으면 null */
async function fetchObservation(
  serviceKey: string,
  lat: number,
  lon: number,
): Promise<KmaObservation | null> {
  const { nx, ny } = toKmaGrid(lat, lon);
  const { baseDate, baseTime } = getKmaBaseTime(Date.now());
  const query = new URLSearchParams({
    serviceKey: normalizeServiceKey(serviceKey),
    pageNo: '1',
    numOfRows: String(KMA_ROWS),
    dataType: 'JSON',
    base_date: baseDate,
    base_time: baseTime,
    nx: String(nx),
    ny: String(ny),
  });
  const res = await fetch(`${KMA_NCST_URL}?${query}`, {
    signal: AbortSignal.timeout(KMA_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`기상청 응답 오류: ${res.status}`);
  return parseKmaObservation(await res.json());
}

/** 한 AWS 관측소의 최근 분자료를 조회한다. 실패·결측이면 null */
async function fetchStationObservation(
  authKey: string,
  stationId: number,
): Promise<KmaObservation | null> {
  const query = buildAwsQuery(authKey, stationId, Date.now());
  const res = await fetch(`${KMA_AWS_MIN_URL}?${query}`, {
    signal: AbortSignal.timeout(KMA_AWS_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`기상청 분자료 응답 오류: ${res.status}`);
  return parseAwsMinute(await res.text(), stationId);
}

/**
 * 가까운 AWS 관측소의 분자료를 가까운 순으로 확인해 처음 유효한 값을 돌려준다.
 * 관측소가 없거나 모두 실패하면 null
 */
async function fetchAwsObservation(
  authKey: string,
  lat: number,
  lon: number,
): Promise<KmaObservation | null> {
  const stations = findNearbyStations(lat, lon);
  const results = await Promise.all(
    stations.map((station) =>
      fetchStationObservation(authKey, station.id).catch((e: unknown) => {
        logServerError(`기상청 분자료 조회 실패 (지점 ${station.id})`, e);
        return null;
      }),
    ),
  );
  return results.find((observation) => observation !== null) ?? null;
}

/** 분자료 → 초단기실황 순으로 실측값을 구한다. 키가 있는 소스만 시도한다. */
async function findObservation(lat: number, lon: number): Promise<KmaObservation | null> {
  const hubKey = process.env.KMA_APIHUB_KEY;
  if (hubKey) {
    const aws = await fetchAwsObservation(normalizeApiHubKey(hubKey), lat, lon);
    if (aws) return aws;
  }
  const serviceKey = process.env.KMA_SERVICE_KEY;
  return serviceKey ? fetchObservation(serviceKey, lat, lon) : null;
}

/** GET /api/weather-now?lat=&lon= : 기상청 실측(AWS 분자료 우선, 초단기실황 폴백)의 기온·습도·풍속을 돌려준다. */
export async function GET(request: Request): Promise<Response> {
  if (!process.env.KMA_APIHUB_KEY && !process.env.KMA_SERVICE_KEY) {
    return json({ error: 'server_not_configured' }, STATUS_SERVER_ERROR);
  }
  const coords = parsePlaceCoords(new URL(request.url).searchParams);
  if (!coords) return json({ error: 'invalid_request' }, STATUS_BAD_REQUEST);
  try {
    const observation = await findObservation(coords.lat, coords.lon);
    if (!observation) return json({ error: 'no_observation' }, STATUS_BAD_GATEWAY);
    return json(observation);
  } catch (e) {
    logServerError('기상청 실황 조회 실패', e);
    return json({ error: 'upstream_failed' }, STATUS_BAD_GATEWAY);
  }
}
