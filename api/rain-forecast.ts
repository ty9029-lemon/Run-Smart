import type { RainForecast } from '../src/lib/rainForecast.js';
import { normalizeServiceKey, toKmaGrid } from './_lib/kmaCore.js';
import {
  KMA_FCST_TIMEOUT_MS,
  KMA_ULTRA_FCST_URL,
  KMA_ULTRA_ROWS,
  KMA_VILAGE_FCST_URL,
  KMA_VILAGE_ROWS,
  buildFcstQuery,
  getUltraBaseTime,
  getVilageBaseTime,
  mergeRainHours,
  parseUltraRain,
  parseVilageRain,
} from './_lib/rainForecastCore.js';
import { parsePlaceCoords } from './_lib/placeCore.js';
import { logServerError } from './_lib/serverLog.js';

/** HTTP 상태 코드 */
const STATUS_BAD_REQUEST = 400;
const STATUS_BAD_GATEWAY = 502;
const STATUS_SERVER_ERROR = 500;
/** CDN 캐시 시간(초). 초단기예보가 매시 갱신되므로 짧게 둔다 */
const CACHE_SECONDS = 300;
/** 한국 표준시(UTC+9)의 밀리초 오프셋 */
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** JSON 응답을 만든다. 성공일 때만 캐시한다. */
function json(body: unknown, status = 200): Response {
  const cache = status === 200 ? `public, s-maxage=${CACHE_SECONDS}` : 'no-store';
  return Response.json(body, { status, headers: { 'Cache-Control': cache } });
}

/** 한국 날짜를 "YYYY-MM-DD"로 만든다. */
function kstToday(nowMs: number): string {
  return new Date(nowMs + KST_OFFSET_MS).toISOString().slice(0, 10);
}

/** 예보 API를 호출해 JSON을 돌려준다. 실패하면 에러 */
async function getFcstJson(url: string, query: URLSearchParams): Promise<unknown> {
  const res = await fetch(`${url}?${query}`, { signal: AbortSignal.timeout(KMA_FCST_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`기상청 예보 응답 오류: ${res.status}`);
  return res.json();
}

/** GET /api/rain-forecast?lat=&lon= : 기상청 단기·초단기예보의 시간대별 강수량·형태를 돌려준다. */
export async function GET(request: Request): Promise<Response> {
  const rawKey = process.env.KMA_SERVICE_KEY;
  if (!rawKey) return json({ error: 'server_not_configured' }, STATUS_SERVER_ERROR);
  const coords = parsePlaceCoords(new URL(request.url).searchParams);
  if (!coords) return json({ error: 'invalid_request' }, STATUS_BAD_REQUEST);
  const serviceKey = normalizeServiceKey(rawKey);
  const grid = toKmaGrid(coords.lat, coords.lon);
  const now = Date.now();
  // 한쪽이 실패해도 다른 쪽으로 보정할 수 있게 따로 받는다
  const [vilage, ultra] = await Promise.allSettled([
    getFcstJson(
      KMA_VILAGE_FCST_URL,
      buildFcstQuery(serviceKey, getVilageBaseTime(now), grid, KMA_VILAGE_ROWS),
    ),
    getFcstJson(
      KMA_ULTRA_FCST_URL,
      buildFcstQuery(serviceKey, getUltraBaseTime(now), grid, KMA_ULTRA_ROWS),
    ),
  ]);
  if (vilage.status === 'rejected') logServerError('기상청 단기예보 조회 실패', vilage.reason);
  if (ultra.status === 'rejected') logServerError('기상청 초단기예보 조회 실패', ultra.reason);
  const hours = mergeRainHours(
    vilage.status === 'fulfilled' ? parseVilageRain(vilage.value) : [],
    ultra.status === 'fulfilled' ? parseUltraRain(ultra.value) : [],
  );
  if (hours.length === 0) return json({ error: 'no_forecast' }, STATUS_BAD_GATEWAY);
  return json({ today: kstToday(now), hours } satisfies RainForecast);
}
