import { Button } from '@/components/ui/button';
import {
  Toast,
  ToastAction,
  ToastDescription,
  ToastProvider,
  ToastViewport,
} from '@/components/ui/toast';
import { formatDepartureToast, MESSAGES } from '../constants/messages';

interface DepartureToastProps {
  open: boolean;
  /** 토스트 문구에 들어갈 활동명 */
  activityLabel: string;
  onOpenChange: (open: boolean) => void;
  /** '실행 취소'를 눌렀을 때 */
  onUndo: () => void;
}

/** 출발을 기록한 직후 보여주는 토스트 (우측 [실행 취소]로 방금 기록을 되돌린다) */
export default function DepartureToast({
  open,
  activityLabel,
  onOpenChange,
  onUndo,
}: DepartureToastProps) {
  return (
    <ToastProvider>
      <Toast open={open} onOpenChange={onOpenChange}>
        <ToastDescription className="whitespace-pre-line">{formatDepartureToast(activityLabel)}</ToastDescription>
        <ToastAction asChild altText={MESSAGES.toastUndo} onClick={onUndo}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 font-bold text-toast-foreground hover:bg-toast-foreground/10 hover:text-toast-foreground"
          >
            {MESSAGES.toastUndo}
          </Button>
        </ToastAction>
      </Toast>
      <ToastViewport className="bottom-[calc(5.5rem+env(safe-area-inset-bottom))]" />
    </ToastProvider>
  );
}
