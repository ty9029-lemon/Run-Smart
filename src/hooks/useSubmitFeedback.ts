import { useCallback } from 'react';
import type { FeedbackSource } from '../constants/feedback';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import { useHistoryStore } from '../store/historyStore';
import { useProfileStore } from '../store/profileStore';
import type { Feedback, HistoryEntry } from '../types';

/**
 * 체감 피드백을 기록에 저장하고 다음 추천의 보정값에 누적한다.
 * 상단 카드와 종료 직후 시트가 함께 쓰므로 이벤트 속성이 같다.
 */
export function useSubmitFeedback(): (
  entry: HistoryEntry,
  feedback: Feedback,
  source: FeedbackSource,
) => void {
  const setFeedback = useHistoryStore((s) => s.setFeedback);
  const applyFeedback = useProfileStore((s) => s.applyFeedback);

  return useCallback(
    (entry, feedback, source) => {
      setFeedback(entry.id, feedback);
      applyFeedback(feedback);
      trackEvent(ANALYTICS_EVENTS.feedbackSubmitted, {
        feedback,
        activity: entry.activity,
        feelsLike: entry.feelsLike ?? 0,
        source,
      });
    },
    [setFeedback, applyFeedback],
  );
}
