import { useState } from 'react';
import { getActivityMeta } from '../constants/activities';
import { useFeedbackPrompt } from '../hooks/useFeedbackPrompt';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import { useHistoryStore } from '../store/historyStore';
import { useProfileStore } from '../store/profileStore';
import type { Feedback } from '../types';

/** 피드백 선택지 */
const OPTIONS: { value: Feedback; label: string }[] = [
  { value: 'cold', label: '추웠어요' },
  { value: 'good', label: '적당했어요' },
  { value: 'hot', label: '더웠어요' },
];

const CARD = 'rounded-panel border border-card-border-ink bg-card-charcoal p-6';

/** 다녀온 뒤 체감을 묻는 카드. 답하면 다음 추천(복장·시간대)에 반영된다. */
export default function FeedbackCard() {
  const pending = useFeedbackPrompt();
  const setFeedback = useHistoryStore((s) => s.setFeedback);
  const applyFeedback = useProfileStore((s) => s.applyFeedback);
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <p className={`${CARD} text-sm`} role="status">
        알려주셔서 고마워요. 다음 추천부터 반영할게요.
      </p>
    );
  }
  if (!pending || pending.id === dismissedId) return null;

  /** 피드백을 기록하고 보정값에 누적한다. */
  const handleSelect = (feedback: Feedback) => {
    setFeedback(pending.id, feedback);
    applyFeedback(feedback);
    trackEvent(ANALYTICS_EVENTS.feedbackSubmitted, {
      feedback,
      activity: pending.activity,
      feelsLike: pending.feelsLike ?? 0,
    });
    setSubmitted(true);
  };

  return (
    <section className={`${CARD} space-y-4`} aria-label="운동 후 피드백">
      <h2 className="text-base font-bold">
        오늘 {getActivityMeta(pending.activity).label}, 어땠어요?
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleSelect(value)}
            className="rounded-full border border-lime-pulse px-3 py-3 text-sm font-medium text-lime-pulse"
          >
            {label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setDismissedId(pending.id)}
        className="w-full text-center text-sm text-steel-border"
      >
        다음에 할게요
      </button>
    </section>
  );
}
