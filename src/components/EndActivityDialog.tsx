import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  formatEndDialogDescription,
  formatEndDialogTitle,
  MESSAGES,
} from '../constants/messages';

interface EndActivityDialogProps {
  open: boolean;
  /** 제목에 들어갈 활동명 */
  activityLabel: string;
  /** 설명에 들어갈 경과 시간 표기 (예: 00:07) */
  elapsedText: string;
  /** '계속하기', ESC, 바깥 탭으로 닫을 때 */
  onContinue: () => void;
  /** '종료하기'를 눌렀을 때 */
  onConfirm: () => void;
}

/** 러닝 중 실수로 종료되지 않도록 한 번 더 묻는 확인 팝업 */
export default function EndActivityDialog({
  open,
  activityLabel,
  elapsedText,
  onContinue,
  onConfirm,
}: EndActivityDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onContinue()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{formatEndDialogTitle(activityLabel)}</DialogTitle>
          <DialogDescription>{formatEndDialogDescription(elapsedText)}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="grid grid-cols-2 gap-2 border-t-0">
          <Button type="button" variant="outline" onClick={onContinue}>
            {MESSAGES.endContinue}
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            {MESSAGES.endConfirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
