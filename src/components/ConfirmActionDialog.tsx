import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ConfirmActionDialogProps {
  open: boolean;
  title: string;
  description: string;
  /** 안전한 선택지(왼쪽, outline) 이름 */
  cancelLabel: string;
  /** 실행 버튼(오른쪽, destructive) 이름 */
  confirmLabel: string;
  /** 취소, ESC, 바깥 탭으로 닫을 때 */
  onCancel: () => void;
  /** 실행 버튼을 눌렀을 때 */
  onConfirm: () => void;
}

/** 되돌리기 어렵거나 값을 잃을 수 있는 동작을 한 번 더 묻는 공용 확인 팝업 (DESIGN.md Confirm Dialog) */
export default function ConfirmActionDialog({
  open,
  title,
  description,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: ConfirmActionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent showCloseButton={false} className="gap-8">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="grid grid-cols-2 gap-2 border-t-0 pt-0">
          <Button type="button" variant="secondary" size="lg" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" variant="destructive" size="lg" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
