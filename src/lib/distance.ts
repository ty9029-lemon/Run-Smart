import {
  DEFAULT_DISTANCE_KM,
  DISTANCE_DECIMAL_UNIT,
  DISTANCE_STEP_KM,
  MAX_DISTANCE_KM,
  MIN_DISTANCE_KM,
} from '../constants/feedback';

/**
 * 거리를 한 단계 늘리거나 줄인다. 아직 입력하지 않았다면 기본값에서 시작한다.
 * @param current 현재 입력한 거리(km), 입력 전이면 null
 * @param direction 1이면 늘리고 -1이면 줄인다
 * @returns 최소·최대 범위로 제한한 거리(km)
 */
export function stepDistanceKm(current: number | null, direction: 1 | -1): number {
  const base = current ?? DEFAULT_DISTANCE_KM;
  const next = base + direction * DISTANCE_STEP_KM;
  return Math.min(MAX_DISTANCE_KM, Math.max(MIN_DISTANCE_KM, next));
}

/**
 * 거리를 화면에 보여줄 문자열로 만든다. (예: 5 → "5km", 5.5 → "5.5km")
 * @param km 거리(km)
 */
export function formatDistanceKm(km: number): string {
  return `${km}km`;
}

/** 숫자와 소수점만 있는 거리 문자열 (예: 5, 5.5, .5) */
const DISTANCE_TEXT_PATTERN = /^(\d+\.?\d*|\.\d+)$/;

/**
 * 입력창에 적은 거리를 km 숫자로 바꾼다. 소수 둘째 자리까지 남긴다.
 * @param text 입력한 글자 (쉼표 소수점도 받는다)
 * @returns 거리(km). 비었거나 숫자가 아니거나 범위를 벗어나면 null
 */
export function parseDistanceKm(text: string): number | null {
  const normalized = text.trim().replace(',', '.');
  if (!DISTANCE_TEXT_PATTERN.test(normalized)) return null;
  const km = Math.round(Number(normalized) * DISTANCE_DECIMAL_UNIT) / DISTANCE_DECIMAL_UNIT;
  return km >= MIN_DISTANCE_KM && km <= MAX_DISTANCE_KM ? km : null;
}
