import { MS_PER_SECOND, REDEPARTURE_DELAY_MS } from '../constants/thresholds';
import type { HistoryEntry } from '../types';

/**
 * 홈 CTA 자리의 상태
 * - ready: 출발 전 (출발하기 버튼)
 * - running: 활동 진행 중 (타이머 버튼)
 * - ended: 활동을 마친 직후 (종료 안내)
 * - departed: 종료 버튼 도입 전에 출발만 기록된 상태 (출발 안내와 취소)
 */
export type DepartureStatus = 'ready' | 'running' | 'ended' | 'departed';

/**
 * 오늘의 기록과 진행 여부로 CTA 상태를 정한다.
 * 다시 출발할 수 있게 되기까지의 대기 시간은 활동을 마친 시각(없으면 출발 시각)부터 센다.
 * @param todayEntry 오늘 이 활동으로 기록한 가장 최근 출발 항목
 * @param isRunning 이 활동이 진행 중인지
 * @param nowMs 현재 시각(ms)
 */
export function getDepartureStatus(
  todayEntry: HistoryEntry | null,
  isRunning: boolean,
  nowMs: number,
): DepartureStatus {
  if (isRunning) return 'running';
  if (!todayEntry) return 'ready';
  const startedMs = new Date(todayEntry.date).getTime();
  const isEnded = todayEntry.durationSec !== undefined;
  const settledMs = isEnded ? startedMs + (todayEntry.durationSec ?? 0) * MS_PER_SECOND : startedMs;
  if (nowMs - settledMs >= REDEPARTURE_DELAY_MS) return 'ready';
  return isEnded ? 'ended' : 'departed';
}
