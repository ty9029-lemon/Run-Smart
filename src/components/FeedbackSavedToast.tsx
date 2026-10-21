import { Toast, ToastDescription, ToastProvider, ToastViewport } from '@/components/ui/toast';
import { FEEDBACK_MESSAGES } from '../constants/feedback';
import { CTA_GAP, TAB_BAR_OFFSET } from '../constants/navigation';

interface FeedbackSavedToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 체감 시트에서 저장하고 기록 탭으로 넘어왔을 때 보여주는 토스트.
 * 하단 탭바에 가리지 않도록 탭바 바로 위에 뜬다.
 */
export default function FeedbackSavedToast({ open, onOpenChange }: FeedbackSavedToastProps) {
  return (
    <ToastProvider>
      <Toast open={open} onOpenChange={onOpenChange}>
        <ToastDescription>{FEEDBACK_MESSAGES.thanks}</ToastDescription>
      </Toast>
      <ToastViewport style={{ bottom: `calc(${TAB_BAR_OFFSET} + ${CTA_GAP})` }} />
    </ToastProvider>
  );
}
