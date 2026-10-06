import {
  KAKAO_REGION_URL,
  KAKAO_TIMEOUT_MS,
  formatRegionLabel,
  isNoRegionStatus,
  parsePlaceCoords,
  type KakaoRegionDoc,
} from './_lib/placeCore.js';
import { logServerError } from './_lib/serverLog.js';

/** HTTP 상태 코드 */
const STATUS_BAD_REQUEST = 400;
const STATUS_BAD_GATEWAY = 502;
const STATUS_SERVER_ERROR = 500;

/**
 * JSON 응답을 만든다.
 * 카카오 정책상 로컬 API 결과는 서버·CDN에 저장할 수 없으므로 항상 no-store로 보낸다.
 */
function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

/** 카카오에 좌표의 행정구역을 물어 문서 목록을 돌려준다. */
async function fetchRegions(apiKey: string, lat: number, lon: number): Promise<KakaoRegionDoc[]> {
  const query = new URLSearchParams({ x: String(lon), y: String(lat) });
  const res = await fetch(`${KAKAO_REGION_URL}?${query}`, {
    headers: { Authorization: `KakaoAK ${apiKey}` },
    signal: AbortSignal.timeout(KAKAO_TIMEOUT_MS),
  });
  // 한국 밖 좌표처럼 행정구역이 없는 경우는 오류가 아니라 "주소 없음"으로 처리한다.
  if (isNoRegionStatus(res.status)) return [];
  if (!res.ok) throw new Error(`카카오 응답 오류: ${res.status}`);
  const body = (await res.json()) as { documents?: KakaoRegionDoc[] };
  return body.documents ?? [];
}

/** GET /api/place?lat=&lon= : 좌표의 행정동을 "서울시 역삼1동" 형태로 돌려준다. */
export async function GET(request: Request): Promise<Response> {
  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) return json({ error: 'server_not_configured' }, STATUS_SERVER_ERROR);
  const coords = parsePlaceCoords(new URL(request.url).searchParams);
  if (!coords) return json({ error: 'invalid_request' }, STATUS_BAD_REQUEST);
  try {
    const documents = await fetchRegions(apiKey, coords.lat, coords.lon);
    return json({ label: formatRegionLabel(documents) });
  } catch (e) {
    logServerError('카카오 행정구역 조회 실패', e);
    return json({ error: 'upstream_failed' }, STATUS_BAD_GATEWAY);
  }
}
