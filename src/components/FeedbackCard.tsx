import { useState } from 'react';
import { getActivityMeta } from '../constants/activities';
import { FEEDBACK_MESSAGES, FEEDBACK_SOURCES, formatFeedbackTitle } from '../constants/feedback';
import { useFeedbackPrompt } from '../hooks/useFeedbackPrompt';
import { useSubmitFeedback } from '../hooks/useSubmitFeedback';
import { formatDayPrefix, formatTime } from '../lib/formatTime';
import { skipFeedback } from '../lib/skipFeedback';
import type { Feedback, FeedbackDetail } from '../types';
import FeedbackForm from './FeedbackForm';

const CARD = 'rounded-panel bg-card-charcoal p-6';

interface FeedbackCardProps {
  /** 이미 다른 곳(종료 직후 시트 등)에서 묻고 있거나 넘긴 기록의 id. 해당 기록은 카드로 묻지 않는다. */
  hiddenEntryIds?: (string | null)[];
}

/** 다녀온 뒤 체감·거리·복장을 묻는 카드. 답하면 다음 추천(복장·시간대)에 반영된다. */
export default function FeedbackCard({ hiddenEntryIds = [] }: FeedbackCardProps) {
  const pending = useFeedbackPrompt();
  const submitFeedback = useSubmitFeedback();
  // 방금 답한 기록 id. 다음 미응답 기록이 있으면 그 기록의 질문이 이어서 나온다.
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  if (submittedId && (!pending || pending.id === submittedId)) {
    return (
      <p className={`${CARD} text-sm`} role="status">
        {FEEDBACK_MESSAGES.thanks}
      </p>
    );
  }
  if (!pending || hiddenEntryIds.includes(pending.id)) return null;

  /** 피드백과 선택 입력(거리·복장)을 기록하고 보정값에 누적한다. */
  const handleSave = (feedback: Feedback, detail: FeedbackDetail) => {
    submitFeedback(pending, feedback, FEEDBACK_SOURCES.card, detail);
    setSubmittedId(pending.id);
  };

  /** 저장 안 하기로 하면 기록을 지운다. */
  const handleSkip = () => skipFeedback(pending, FEEDBACK_SOURCES.card);

  return (
    <section className={`${CARD} space-y-4`} aria-label={FEEDBACK_MESSAGES.ariaLabel}>
      <h2 className="text-base font-bold">
        {formatFeedbackTitle(
          formatTime(pending.date),
          getActivityMeta(pending.activity).label,
          formatDayPrefix(pending.date),
        )}
      </h2>
      <FeedbackForm key={pending.id} onSave={handleSave} onLater={handleSkip} />
    </section>
  );
}
