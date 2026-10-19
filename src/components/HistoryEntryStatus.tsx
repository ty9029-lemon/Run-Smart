import {
  FEEDBACK_LABELS,
  FEEDBACK_MESSAGES,
  FEEDBACK_SOURCES,
  FEEDBACK_TEXT_CLASS,
} from '../constants/feedback';
import { getActivityMeta } from '../constants/activities';
import { HISTORY_MESSAGES } from '../constants/messages';
import { useStopwatch } from '../hooks/useStopwatch';
import { useSubmitFeedback } from '../hooks/useSubmitFeedback';
import { formatElapsed } from '../lib/formatElapsed';
import { formatTime } from '../lib/formatTime';
import type { Feedback, HistoryEntry } from '../types';
import FeedbackChoices from './FeedbackChoices';
import HistoryStats from './HistoryStats';

interface HistoryEntryStatusProps {
  entry: HistoryEntry;
  /** 이 기록의 활동이 진행 중이면 시작 시각(ms), 아니면 null */
  runningStartedAt: number | null;
  /** 지금 체감을 물어볼 수 있는 기록인지 (홈 카드와 같은 기준) */
  askFeedback: boolean;
}

/** 진행 중이면 `진행 중 · 00:21`을 실시간으로 보여준다. */
function RunningLabel({ startedAt }: { startedAt: number }) {
  const elapsedText = formatElapsed(useStopwatch(startedAt));
  return (
    <span className="font-medium tabular-nums text-lime-pulse">
      {HISTORY_MESSAGES.running} · {elapsedText}
    </span>
  );
}

/** 체감을 남긴 기록의 체감 결과 (적당=파랑, 춥거나 더우면 주황) */
function FeedbackResult({ feedback }: { feedback: Feedback }) {
  return (
    <p className="shrink-0 text-base">
      <span className="mr-2 text-subtle-text">{HISTORY_MESSAGES.feedbackLabel}</span>
      <span className={`font-bold ${FEEDBACK_TEXT_CLASS[feedback]}`}>
        {FEEDBACK_LABELS[feedback]}
      </span>
    </p>
  );
}

/**
 * 기록 카드 상단: 시작 시각(진행 중이면 경과 시간), 활동 이름과 체감 결과, 거리·페이스·시간.
 * 체감을 아직 못 남겼으면 바로 남길 수 있게 한다.
 */
export default function HistoryEntryStatus({
  entry,
  runningStartedAt,
  askFeedback,
}: HistoryEntryStatusProps) {
  const submitFeedback = useSubmitFeedback();

  /** 기록 화면에서 체감을 남긴다. */
  const handleSelect = (feedback: Feedback) => {
    submitFeedback(entry, feedback, FEEDBACK_SOURCES.history);
  };

  return (
    <>
      <p className="text-base text-subtle-text">
        {formatTime(entry.date)}
        {runningStartedAt !== null && (
          <>
            {' · '}
            <RunningLabel startedAt={runningStartedAt} />
          </>
        )}
      </p>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <p className="text-xl font-bold">{getActivityMeta(entry.activity).label}</p>
        {entry.feedback && <FeedbackResult feedback={entry.feedback} />}
      </div>
      {runningStartedAt === null && <HistoryStats entry={entry} />}
      {!entry.feedback && askFeedback && (
        <div className="mt-5 space-y-3" role="group" aria-label={FEEDBACK_MESSAGES.historyPrompt}>
          <p className="text-sm font-medium">{FEEDBACK_MESSAGES.historyPrompt}</p>
          <FeedbackChoices onSelect={handleSelect} />
        </div>
      )}
    </>
  );
}
