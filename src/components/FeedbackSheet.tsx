import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getActivityMeta } from '../constants/activities';
import {
  FEEDBACK_MESSAGES,
  FEEDBACK_SOURCES,
  formatFeedbackTitle,
} from '../constants/feedback';
import { FEEDBACK_SHEET_THANKS_MS } from '../constants/thresholds';
import { useSubmitFeedback } from '../hooks/useSubmitFeedback';
import { formatTime } from '../lib/formatTime';
import type { Feedback, HistoryEntry } from '../types';
import FeedbackChoices from './FeedbackChoices';

/** 화면 아래에서 올라오는 시트 모양 (드래그 없이 버튼·바깥 탭·ESC로 닫는다) */
const SHEET_CLASS = [
  'top-auto bottom-0 translate-y-0 max-w-full sm:max-w-md rounded-b-none',
  'pb-[calc(1.5rem+env(safe-area-inset-bottom))]',
  'data-open:zoom-in-100 data-open:slide-in-from-bottom',
  'data-closed:zoom-out-100 data-closed:slide-out-to-bottom',
].join(' ');

interface FeedbackSheetProps {
  /** 방금 마친 활동의 기록. 없으면 시트를 닫아 둔다 */
  entry: HistoryEntry | null;
  /** 답하지 않고 닫았을 때 */
  onDismiss: (entry: HistoryEntry) => void;
  /** 답하고 감사 문구까지 보여준 뒤 닫을 때 */
  onClose: () => void;
}

/** 활동을 마친 직후 체감을 묻는 바텀 시트. 답하지 않고 넘어가면 앱 재방문 때 상단 카드가 이어서 묻는다. */
export default function FeedbackSheet({ entry, onDismiss, onClose }: FeedbackSheetProps) {
  const submitFeedback = useSubmitFeedback();
  const [answeredId, setAnsweredId] = useState<string | null>(null);
  const answered = entry !== null && answeredId === entry.id;

  // 감사 문구를 잠깐 보여준 뒤 자동으로 닫는다
  useEffect(() => {
    if (!answered) return undefined;
    const timer = setTimeout(onClose, FEEDBACK_SHEET_THANKS_MS);
    return () => clearTimeout(timer);
  }, [answered, onClose]);

  if (!entry) return null;

  /** 닫기: 답한 뒤라면 그냥 닫고, 아니면 '나중에'로 알린다. */
  const handleOpenChange = (open: boolean) => {
    if (open) return;
    if (answered) onClose();
    else onDismiss(entry);
  };

  /** 답을 저장하고 감사 문구로 바꾼다. 저장은 선택 즉시 끝난다. */
  const handleSelect = (feedback: Feedback) => {
    submitFeedback(entry, feedback, FEEDBACK_SOURCES.sheet);
    setAnsweredId(entry.id);
  };

  const title = formatFeedbackTitle(
    formatTime(entry.date),
    getActivityMeta(entry.activity).label,
  );

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} className={SHEET_CLASS}>
        {answered ? (
          <p role="status" className="py-4 text-center text-base font-medium">
            {FEEDBACK_MESSAGES.thanks}
          </p>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg">{title}</DialogTitle>
              <DialogDescription>{FEEDBACK_MESSAGES.sheetDescription}</DialogDescription>
            </DialogHeader>
            <FeedbackChoices
              onSelect={handleSelect}
              onLater={() => onDismiss(entry)}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
