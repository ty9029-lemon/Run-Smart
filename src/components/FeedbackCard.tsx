import { useState } from 'react';
import { getActivityMeta } from '../constants/activities';
import { FEEDBACK_MESSAGES, FEEDBACK_SOURCES, formatFeedbackTitle } from '../constants/feedback';
import { useFeedbackPrompt } from '../hooks/useFeedbackPrompt';
import { useSubmitFeedback } from '../hooks/useSubmitFeedback';
import { formatTime } from '../lib/formatTime';
import type { Feedback } from '../types';
import FeedbackChoices from './FeedbackChoices';

const CARD = 'rounded-panel border border-card-border-ink bg-card-charcoal p-6';

interface FeedbackCardProps {
  /** '다음에 할게요'로 닫았을 때, 닫은 기록의 id와 함께 알린다. */
  onDismiss?: (id: string) => void;
  /** 이미 다른 곳(종료 직후 시트 등)에서 묻고 있거나 넘긴 기록의 id. 해당 기록은 카드로 묻지 않는다. */
  hiddenEntryIds?: (string | null)[];
}

/** 다녀온 뒤 체감을 묻는 카드. 답하면 다음 추천(복장·시간대)에 반영된다. */
export default function FeedbackCard({ onDismiss, hiddenEntryIds = [] }: FeedbackCardProps) {
  const pending = useFeedbackPrompt();
  const submitFeedback = useSubmitFeedback();
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  // 방금 답한 기록 id. 다음 미응답 기록이 있으면 그 기록의 질문이 이어서 나온다.
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  if (submittedId && (!pending || pending.id === submittedId)) {
    return (
      <p className={`${CARD} text-sm`} role="status">
        {FEEDBACK_MESSAGES.thanks}
      </p>
    );
  }
  if (!pending || pending.id === dismissedId || hiddenEntryIds.includes(pending.id)) return null;

  /** 피드백을 기록하고 보정값에 누적한다. */
  const handleSelect = (feedback: Feedback) => {
    submitFeedback(pending, feedback, FEEDBACK_SOURCES.card);
    setSubmittedId(pending.id);
  };

  /** 이번 방문에서는 다시 묻지 않는다. */
  const handleLater = () => {
    setDismissedId(pending.id);
    onDismiss?.(pending.id);
  };

  return (
    <section className={`${CARD} space-y-4`} aria-label={FEEDBACK_MESSAGES.ariaLabel}>
      <h2 className="text-base font-bold">
        {formatFeedbackTitle(formatTime(pending.date), getActivityMeta(pending.activity).label)}
      </h2>
      <FeedbackChoices onSelect={handleSelect} onLater={handleLater} />
    </section>
  );
}
