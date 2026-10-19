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

/**
 * 출발을 기록한 직후 보여주는 토스트 (우측 [실행 취소]로 방금 기록을 되돌린다).
 * 가장 가까운 relative 조상(출발 버튼 영역) 바로 위에 8px(mb-2) 간격을 두고 뜬다.
 */
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
          <Button type="button" variant="secondary" size="sm" className="shrink-0">
            {MESSAGES.toastUndo}
          </Button>
        </ToastAction>
      </Toast>
      <ToastViewport className="absolute bottom-full mb-2 max-w-none px-0" />
    </ToastProvider>
  );
}
