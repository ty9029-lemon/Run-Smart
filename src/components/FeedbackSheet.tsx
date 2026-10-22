import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getActivityMeta } from '../constants/activities';
import { BOTTOM_SHEET_CLASS, SHEET_HEADER_CLASS } from '../constants/sheetStyles';
import {
  FEEDBACK_MESSAGES,
  FEEDBACK_SOURCES,
  formatFeedbackTitle,
} from '../constants/feedback';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import { useSubmitFeedback } from '../hooks/useSubmitFeedback';
import { formatDayPrefix, formatTime } from '../lib/formatTime';
import type { Feedback, FeedbackDetail, HistoryEntry } from '../types';
import FeedbackForm from './FeedbackForm';

interface FeedbackSheetProps {
  /** 방금 마친 활동의 기록. 없으면 시트를 닫아 둔다 */
  entry: HistoryEntry | null;
  /** 바깥 탭·ESC로 답하지 않고 닫았을 때 (기록은 남기고 앱을 다시 열면 상단 카드가 묻는다) */
  onDismiss: (entry: HistoryEntry) => void;
  /** '저장 안 할래요'를 눌렀을 때 (기록을 지운다) */
  onSkip: (entry: HistoryEntry) => void;
  /** 체감을 저장했을 때 (감사 문구는 이동한 화면의 토스트가 맡는다) */
  onSaved: () => void;
}

/** 활동을 마친 직후 체감·거리·복장을 묻는 바텀 시트. 답하지 않고 넘어가면 앱 재방문 때 상단 카드가 이어서 묻는다. */
export default function FeedbackSheet({ entry, onDismiss, onSkip, onSaved }: FeedbackSheetProps) {
  const submitFeedback = useSubmitFeedback();
  const entryId = entry?.id;
  const entryActivity = entry?.activity;

  // 시트가 새 기록으로 열릴 때마다 한 번 기록한다 (제출·닫기·건너뛰기 전환율의 분모)
  useEffect(() => {
    if (entryId === undefined || entryActivity === undefined) return;
    trackEvent(ANALYTICS_EVENTS.feedbackSheetOpened, { activity: entryActivity });
  }, [entryId, entryActivity]);

  if (!entry) return null;

  /** 닫기: 답하지 않고 닫으면 '나중에'로 알린다. */
  const handleOpenChange = (open: boolean) => {
    if (!open) onDismiss(entry);
  };

  /** 체감과 선택 입력(거리·복장)을 저장하고 시트를 닫는다. */
  const handleSave = (feedback: Feedback, detail: FeedbackDetail) => {
    submitFeedback(entry, feedback, FEEDBACK_SOURCES.sheet, detail);
    onSaved();
  };

  const title = formatFeedbackTitle(
    formatTime(entry.date),
    getActivityMeta(entry.activity).label,
    formatDayPrefix(entry.date),
  );

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent className={BOTTOM_SHEET_CLASS}>
        <DialogHeader className={SHEET_HEADER_CLASS}>
          <DialogTitle className="text-subheading-sm">{title}</DialogTitle>
          <DialogDescription>{FEEDBACK_MESSAGES.sheetDescription}</DialogDescription>
        </DialogHeader>
        <FeedbackForm key={entry.id} onSave={handleSave} onLater={() => onSkip(entry)} />
      </DialogContent>
    </Dialog>
  );
}
