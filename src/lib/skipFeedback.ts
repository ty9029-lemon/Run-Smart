import type { FeedbackSource } from '../constants/feedback';
import { useHistoryStore } from '../store/historyStore';
import type { HistoryEntry } from '../types';
import { ANALYTICS_EVENTS, trackEvent } from './analytics';

/**
 * 체감을 남기지 않고 저장 안 하기로 한 기록을 기록에서 지운다.
 * (답하지 않았으므로 나중에 다시 묻지도 않는다)
 * @param entry 지울 기록
 * @param source 어느 화면에서 눌렀는지 (이벤트 속성)
 */
export function skipFeedback(entry: HistoryEntry, source: FeedbackSource): void {
  trackEvent(ANALYTICS_EVENTS.feedbackSkipped, { activity: entry.activity, source });
  useHistoryStore.getState().removeEntry(entry.id);
}
