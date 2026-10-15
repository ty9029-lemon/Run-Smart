import { MINUTES_PER_HOUR, MS_PER_SECOND, SECONDS_PER_MINUTE } from '../constants/thresholds';

/** 숫자를 두 자리로 맞춘다. (예: 7 → '07') */
function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * 경과 시간을 타이머 형식으로 바꾼다.
 * 1시간 미만은 `mm:ss`(예: 00:07), 1시간 이상은 `h:mm:ss`(예: 1:00:01)로 표시한다.
 * @param elapsedMs 경과 시간(ms). 음수는 0으로 본다
 */
export function formatElapsed(elapsedMs: number): string {
  const totalSeconds = Math.floor(Math.max(0, elapsedMs) / MS_PER_SECOND);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  const totalMinutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  if (hours === 0) return `${pad2(minutes)}:${pad2(seconds)}`;
  return `${hours}:${pad2(minutes)}:${pad2(seconds)}`;
}
