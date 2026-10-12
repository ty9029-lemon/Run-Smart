import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getActivityMeta } from '../constants/activities';
import { FEEDBACK_LABELS, FEEDBACK_ORDER } from '../constants/feedback';
import { useFeedbackPrompt } from '../hooks/useFeedbackPrompt';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import { formatTime } from '../lib/formatTime';
import { useHistoryStore } from '../store/historyStore';
import { useProfileStore } from '../store/profileStore';
import type { Feedback } from '../types';

/** 피드백 선택지 */
const OPTIONS: { value: Feedback; label: string }[] = FEEDBACK_ORDER.map((value) => ({
  value,
  label: FEEDBACK_LABELS[value],
}));

const CARD = 'rounded-panel border border-card-border-ink bg-card-charcoal p-6';

interface FeedbackCardProps {
  /** '다음에 할게요'로 닫았을 때, 닫은 기록의 id와 함께 알린다. */
  onDismiss?: (id: string) => void;
}

/** 다녀온 뒤 체감을 묻는 카드. 답하면 다음 추천(복장·시간대)에 반영된다. */
export default function FeedbackCard({ onDismiss }: FeedbackCardProps) {
  const pending = useFeedbackPrompt();
  const setFeedback = useHistoryStore((s) => s.setFeedback);
  const applyFeedback = useProfileStore((s) => s.applyFeedback);
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  // 방금 답한 기록 id. 다음 미응답 기록이 있으면 그 기록의 질문이 이어서 나온다.
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  if (submittedId && (!pending || pending.id === submittedId)) {
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
    setSubmittedId(pending.id);
  };

  return (
    <section className={`${CARD} space-y-4`} aria-label="운동 후 피드백">
      <h2 className="text-base font-bold">
        {formatTime(pending.date)} {getActivityMeta(pending.activity).label}, 어땠어요?
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map(({ value, label }) => (
          <Button
            key={value}
            type="button"
            variant="outline"
            onClick={() => handleSelect(value)}
            className="px-3 text-sm"
          >
            {label}
          </Button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          setDismissedId(pending.id);
          onDismiss?.(pending.id);
        }}
        className="w-full text-center text-sm text-steel-border"
      >
        다음에 할게요
      </button>
    </section>
  );
}
