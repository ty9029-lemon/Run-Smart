import {
  AIRKOREA_FORECAST_TIMEOUT_MS,
  AIRKOREA_FORECAST_URL,
  buildForecastQuery,
  formatKstDate,
  parseForecastDays,
  parseNearestAddress,
  resolveForecastRegion,
  type AirForecast,
} from './_lib/airForecastCore.js';
import {
  AIRKOREA_NEARBY_URL,
  AIRKOREA_TIMEOUT_MS,
  buildNearbyQuery,
  toTm,
} from './_lib/airKoreaCore.js';
import { normalizeServiceKey } from './_lib/kmaCore.js';
import { parsePlaceCoords } from './_lib/placeCore.js';
import { logServerError } from './_lib/serverLog.js';

/** HTTP 상태 코드 */
const STATUS_BAD_REQUEST = 400;
const STATUS_BAD_GATEWAY = 502;
const STATUS_SERVER_ERROR = 500;
/** CDN 캐시 시간(초). 예보통보는 하루 4번쯤 발표되므로 길게 둔다 */
const CACHE_SECONDS = 1800;

/** JSON 응답을 만든다. 성공일 때만 캐시한다. */
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
async function getAirJson(url: string, query: string, timeoutMs: number): Promise<unknown> {
  const res = await fetch(`${url}?${query}`, { signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`에어코리아 응답 오류: ${res.status}`);
  return res.json();
}

/** 좌표가 속한 예보 지역 이름을 구한다. 가장 가까운 측정소의 주소로 정한다. */
async function findRegion(serviceKey: string, lat: number, lon: number): Promise<string | null> {
  const nearby = await getAirJson(
    AIRKOREA_NEARBY_URL,
    buildNearbyQuery(serviceKey, toTm(lat, lon)),
    AIRKOREA_TIMEOUT_MS,
  );
  const addr = parseNearestAddress(nearby);
  return addr ? resolveForecastRegion(addr, lon) : null;
}

/** GET /api/air-forecast?lat=&lon= : 좌표가 속한 지역의 PM10 예보 등급(오늘·내일·모레)을 돌려준다. */
export async function GET(request: Request): Promise<Response> {
  const serviceKey = getServiceKey();
  if (!serviceKey) return json({ error: 'server_not_configured' }, STATUS_SERVER_ERROR);
  const coords = parsePlaceCoords(new URL(request.url).searchParams);
  if (!coords) return json({ error: 'invalid_request' }, STATUS_BAD_REQUEST);
  try {
    const region = await findRegion(serviceKey, coords.lat, coords.lon);
    if (!region) return json({ error: 'unknown_region' }, STATUS_BAD_GATEWAY);
    const today = formatKstDate(Date.now());
    const body = await getAirJson(
      AIRKOREA_FORECAST_URL,
      buildForecastQuery(serviceKey, today),
      AIRKOREA_FORECAST_TIMEOUT_MS,
    );
    const days = parseForecastDays(body, region);
    if (days.length === 0) return json({ error: 'no_forecast' }, STATUS_BAD_GATEWAY);
    return json({ today, days } satisfies AirForecast);
  } catch (e) {
    logServerError('에어코리아 예보통보 조회 실패', e);
    return json({ error: 'upstream_failed' }, STATUS_BAD_GATEWAY);
  }
}
