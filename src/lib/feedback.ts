import {
  FEEDBACK_ASK_DELAY_MS,
  FEEDBACK_EXPIRE_MS,
  FEEDBACK_OFFSET_LIMIT,
  FEEDBACK_STEP,
} from '../constants/thresholds';
import type { Feedback, HistoryEntry } from '../types';

/** 피드백이 체감온도 보정에 주는 변화(°C). 추웠으면 더 춥게(-), 더웠으면 더 덥게(+) 본다 */
const FEEDBACK_DELTA: Record<Feedback, number> = {
  cold: -FEEDBACK_STEP,
  good: 0,
  hot: FEEDBACK_STEP,
};

/**
 * 이 기록에 지금 체감을 물어볼 수 있는지 확인한다. (홈 카드와 기록 화면이 같은 기준을 쓴다)
 * @param entry 히스토리 기록
 * @param now 현재 시각(ms)
 * @param activeEntryId 진행 중인 활동의 기록 id
 */
export function isFeedbackAskable(
  entry: HistoryEntry,
  now: number,
  activeEntryId: string | null = null,
): boolean {
  if (entry.feedback || entry.id === activeEntryId) return false;
  const elapsed = now - new Date(entry.date).getTime();
  const isEnded = entry.durationSec !== undefined;
  return (isEnded || elapsed >= FEEDBACK_ASK_DELAY_MS) && elapsed < FEEDBACK_EXPIRE_MS;
}

/**
 * 지금 피드백을 물어볼 기록을 찾는다.
 * 아직 피드백이 없고 너무 오래되지 않은 가장 최근 기록이다.
 * 활동을 마친 기록(활동 시간이 있는 기록)은 바로 묻고, 그렇지 않은 기록은 일정 시간이 지난 뒤에 묻는다.
 * 진행 중인 활동은 아직 끝나지 않았으므로 묻지 않는다.
 * @param entries 히스토리 기록
 * @param now 현재 시각(ms)
 * @param activeEntryId 진행 중인 활동의 기록 id
 */
export function findPendingFeedback(
  entries: HistoryEntry[],
  now: number,
  activeEntryId: string | null = null,
): HistoryEntry | null {
  const candidates = entries.filter((e) => isFeedbackAskable(e, now, activeEntryId));
  return candidates.reduce<HistoryEntry | null>(
    (latest, e) => (!latest || e.date > latest.date ? e : latest),
    null,
  );
}

/**
 * 피드백을 보정값에 누적한다. 최대 ±FEEDBACK_OFFSET_LIMIT °C로 제한한다.
 * @param offset 현재 보정값(°C)
 * @param feedback 새 피드백
 */
export function applyFeedbackToOffset(offset: number, feedback: Feedback): number {
  const next = offset + FEEDBACK_DELTA[feedback];
  return Math.min(FEEDBACK_OFFSET_LIMIT, Math.max(-FEEDBACK_OFFSET_LIMIT, next));
}
