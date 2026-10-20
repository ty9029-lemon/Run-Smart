import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { HISTORY_MENU_MESSAGES } from '../constants/messages';

interface DeleteEntryDialogProps {
  /** '취소', ESC, 바깥 탭으로 닫을 때 */
  onCancel: () => void;
  /** '삭제'를 눌렀을 때 */
  onConfirm: () => void;
}

/** 기록을 지우기 전에 한 번 더 묻는 확인 팝업 (삭제한 기록은 되돌릴 수 없다) */
export default function DeleteEntryDialog({ onCancel, onConfirm }: DeleteEntryDialogProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{HISTORY_MENU_MESSAGES.deleteTitle}</DialogTitle>
          <DialogDescription>{HISTORY_MENU_MESSAGES.deleteDescription}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="grid grid-cols-2 gap-2 border-t-0">
          <Button type="button" variant="secondary" size="lg" onClick={onCancel}>
            {HISTORY_MENU_MESSAGES.cancel}
          </Button>
          <Button type="button" variant="destructive" size="lg" onClick={onConfirm}>
            {HISTORY_MENU_MESSAGES.remove}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
