import { PLACE_API_PATH, PLACE_COORD_DIGITS, PLACE_TIMEOUT_MS, type Coords } from '../constants/api';

/**
 * 좌표의 행정동 이름(예: "서울시 역삼1동")을 조회한다.
 * 카카오 로컬 API 정책상 응답 데이터는 기기나 서버에 저장할 수 없으므로
 * localStorage 등에 캐시하지 않고 호출할 때마다 새로 받는다.
 * @param coords 현재 위치 좌표
 * @returns 이름을 알 수 없거나 조회에 실패하면 null
 */
export async function fetchPlaceLabel(coords: Coords): Promise<string | null> {
  const query = new URLSearchParams({
    lat: coords.lat.toFixed(PLACE_COORD_DIGITS),
    lon: coords.lon.toFixed(PLACE_COORD_DIGITS),
  });
  const res = await fetch(`${PLACE_API_PATH}?${query}`, {
    signal: AbortSignal.timeout(PLACE_TIMEOUT_MS),
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { label?: string | null };
  return body.label ?? null;
}
