import { SECONDS_PER_MINUTE } from '../constants/thresholds';

/** 페이스의 초 단위를 맞출 자릿수 (예: 6′05″) */
const PACE_SECONDS_DIGITS = 2;

/**
 * 1km를 가는 데 걸린 시간(초)을 구한다.
 * @param distanceKm 거리(km)
 * @param durationSec 활동 시간(초)
 * @returns 페이스(초/km). 거리나 시간이 없거나 0 이하면 null
 */
export function calcPaceSecPerKm(distanceKm?: number, durationSec?: number): number | null {
  if (!distanceKm || !durationSec || distanceKm <= 0 || durationSec <= 0) return null;
  return durationSec / distanceKm;
}

/**
 * 페이스를 분′초″ 형식으로 바꾼다. (예: 409초 → 6′49″)
 * @param secPerKm 페이스(초/km)
 */
export function formatPace(secPerKm: number): string {
  const totalSeconds = Math.round(secPerKm);
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = String(totalSeconds % SECONDS_PER_MINUTE).padStart(PACE_SECONDS_DIGITS, '0');
  return `${minutes}′${seconds}″`;
}
