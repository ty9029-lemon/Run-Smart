import { FEEDBACK_LABELS, FEEDBACK_MESSAGES, FEEDBACK_SOURCES } from '../constants/feedback';
import { HISTORY_MESSAGES } from '../constants/messages';
import { useStopwatch } from '../hooks/useStopwatch';
import { useSubmitFeedback } from '../hooks/useSubmitFeedback';
import { formatDurationText, formatElapsed } from '../lib/formatElapsed';
import { formatTime } from '../lib/formatTime';
import type { Feedback, HistoryEntry } from '../types';
import FeedbackChoices from './FeedbackChoices';

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

/**
 * 기록 카드의 시각·활동 시간·체감 영역.
 * 시작 시각 옆에 활동 시간(또는 진행 중 경과 시간)을 붙이고, 체감을 아직 못 남겼으면 바로 남길 수 있게 한다.
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
      <p className="text-sm text-subtle-text">
        {formatTime(entry.date)}
        {runningStartedAt !== null && (
          <>
            {' · '}
            <RunningLabel startedAt={runningStartedAt} />
          </>
        )}
        {runningStartedAt === null && entry.durationSec !== undefined && (
          <> · {formatDurationText(entry.durationSec)}</>
        )}
      </p>
      {entry.feedback && (
        <p className="mt-3 text-sm">
          <span className="text-subtle-text">체감 </span>
          <span className="font-medium">{FEEDBACK_LABELS[entry.feedback]}</span>
        </p>
      )}
      {!entry.feedback && askFeedback && (
        <div className="mt-4 space-y-3" role="group" aria-label={FEEDBACK_MESSAGES.historyPrompt}>
          <p className="text-sm font-medium">{FEEDBACK_MESSAGES.historyPrompt}</p>
          <FeedbackChoices onSelect={handleSelect} />
        </div>
      )}
    </>
  );
}
