import {
  AIRKOREA_NEARBY_URL,
  AIRKOREA_REALTIME_URL,
  AIRKOREA_TIMEOUT_MS,
  buildNearbyQuery,
  buildRealtimeQuery,
  parseNearbyStations,
  parseRealtime,
  toTm,
  type AirObservation,
} from './_lib/airKoreaCore.js';
import { normalizeServiceKey } from './_lib/kmaCore.js';
import { parsePlaceCoords } from './_lib/placeCore.js';
import { logServerError } from './_lib/serverLog.js';

/** HTTP 상태 코드 */
const STATUS_BAD_REQUEST = 400;
const STATUS_BAD_GATEWAY = 502;
const STATUS_SERVER_ERROR = 500;
/** CDN 캐시 시간(초). 측정값은 매시 갱신되므로 짧게 둔다 */
const CACHE_SECONDS = 300;

/** JSON 응답을 만든다. 성공일 때만 짧게 캐시한다. */
function json(body: unknown, status = 200): Response {
  const cache = status === 200 ? `public, s-maxage=${CACHE_SECONDS}` : 'no-store';
  return Response.json(body, { status, headers: { 'Cache-Control': cache } });
}

/** 에어코리아 서비스키를 구한다. 전용 키가 없으면 기상청 서비스키(같은 공공데이터포털 키)를 쓴다. */
function getServiceKey(): string | null {
  const key = process.env.AIRKOREA_SERVICE_KEY ?? process.env.KMA_SERVICE_KEY;
  return key ? normalizeServiceKey(key) : null;
}

/** 에어코리아 API를 호출해 JSON을 돌려준다. 실패하면 에러 */
async function getAirJson(url: string, query: string): Promise<unknown> {
  const res = await fetch(`${url}?${query}`, { signal: AbortSignal.timeout(AIRKOREA_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`에어코리아 응답 오류: ${res.status}`);
  return res.json();
}

/** 한 측정소의 최근 PM10 실측값을 조회한다. 실패·결측이면 null */
async function fetchStationObservation(
  serviceKey: string,
  stationName: string,
): Promise<AirObservation | null> {
  try {
    const body = await getAirJson(AIRKOREA_REALTIME_URL, buildRealtimeQuery(serviceKey, stationName));
    return parseRealtime(body, stationName);
  } catch (e) {
    logServerError(`에어코리아 실측 조회 실패 (${stationName})`, e);
    return null;
  }
}

/** 가까운 측정소부터 확인해 처음 유효한 PM10 실측값을 돌려준다. 모두 결측이면 null */
async function findAirObservation(
  serviceKey: string,
  lat: number,
  lon: number,
): Promise<AirObservation | null> {
  const nearby = await getAirJson(AIRKOREA_NEARBY_URL, buildNearbyQuery(serviceKey, toTm(lat, lon)));
  const stations = parseNearbyStations(nearby);
  const results = await Promise.all(
    stations.map((name) => fetchStationObservation(serviceKey, name)),
  );
  return results.find((observation) => observation !== null) ?? null;
}

/** GET /api/air-now?lat=&lon= : 가까운 측정소의 PM10·PM2.5 실측값(에어코리아)을 돌려준다. */
export async function GET(request: Request): Promise<Response> {
  const serviceKey = getServiceKey();
  if (!serviceKey) return json({ error: 'server_not_configured' }, STATUS_SERVER_ERROR);
  const coords = parsePlaceCoords(new URL(request.url).searchParams);
  if (!coords) return json({ error: 'invalid_request' }, STATUS_BAD_REQUEST);
  try {
    const observation = await findAirObservation(serviceKey, coords.lat, coords.lon);
    if (!observation) return json({ error: 'no_observation' }, STATUS_BAD_GATEWAY);
    return json(observation);
  } catch (e) {
    logServerError('에어코리아 조회 실패', e);
    return json({ error: 'upstream_failed' }, STATUS_BAD_GATEWAY);
  }
}
