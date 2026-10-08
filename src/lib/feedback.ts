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
 * 지금 피드백을 물어볼 기록을 찾는다.
 * '가기'로 기록했고 아직 피드백이 없으며, 일정 시간이 지났고 너무 오래되지 않은 가장 최근 기록이다.
 * @param entries 히스토리 기록
 * @param now 현재 시각(ms)
 */
export function findPendingFeedback(entries: HistoryEntry[], now: number): HistoryEntry | null {
  const candidates = entries.filter((e) => {
    if (e.decision !== 'go' || e.feedback) return false;
    const elapsed = now - new Date(e.date).getTime();
    return elapsed >= FEEDBACK_ASK_DELAY_MS && elapsed < FEEDBACK_EXPIRE_MS;
  });
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
