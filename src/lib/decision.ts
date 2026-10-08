import { DECISION_LOCK_MS } from '../constants/thresholds';

/**
 * 결정을 기록한 직후라 버튼 대신 피드백과 '취소하기'를 보여줄 때인지 판단한다.
 * @param entryDate 결정을 기록한 시각(ISO 문자열)
 * @param now 현재 시각(ms)
 */
export function isDecisionLocked(entryDate: string, now: number): boolean {
  return now - new Date(entryDate).getTime() < DECISION_LOCK_MS;
}
