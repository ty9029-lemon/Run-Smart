import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { HISTORY_MENU_MESSAGES } from '../constants/messages';
import { BOTTOM_SHEET_CLASS } from '../constants/sheetStyles';
import { parseDistanceKm } from '../lib/distance';
import type { FeedbackDetail, HistoryEntry } from '../types';
import FeedbackDetailFields from './FeedbackDetailFields';
import { buildFeedbackDetail } from './FeedbackForm';

interface HistoryEditSheetProps {
  /** 수정할 기록 */
  entry: HistoryEntry;
  /** 저장 버튼을 눌렀을 때 새 거리·복장을 알린다. (둘 다 비우면 둘 다 지운다) */
  onSave: (detail: FeedbackDetail) => void;
  onClose: () => void;
}

/** 기록의 거리·실제 복장을 고치거나 채우는 바텀 시트. 열릴 때마다 현재 값에서 시작한다. */
export default function HistoryEditSheet({ entry, onSave, onClose }: HistoryEditSheetProps) {
  const [distanceText, setDistanceText] = useState(entry.distanceKm?.toString() ?? '');
  const [outfitText, setOutfitText] = useState(entry.actualOutfit ?? '');
  const isDistanceInvalid = distanceText.trim() !== '' && parseDistanceKm(distanceText) === null;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className={BOTTOM_SHEET_CLASS}>
        <DialogHeader>
          <DialogTitle className="text-subheading-sm">{HISTORY_MENU_MESSAGES.editTitle}</DialogTitle>
          <DialogDescription>{HISTORY_MENU_MESSAGES.editDescription}</DialogDescription>
        </DialogHeader>
        <div className="space-y-9">
          <FeedbackDetailFields
            distanceText={distanceText}
            outfitText={outfitText}
            isDistanceInvalid={isDistanceInvalid}
            onDistanceChange={setDistanceText}
            onOutfitChange={setOutfitText}
          />
          <div className="space-y-1">
            <Button
              type="button"
              size="lg"
              disabled={isDistanceInvalid}
              onClick={() => onSave(buildFeedbackDetail(distanceText, outfitText))}
              className="w-full"
            >
              {HISTORY_MENU_MESSAGES.save}
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={onClose}
              className="w-full text-sm font-bold text-muted-foreground"
            >
              {HISTORY_MENU_MESSAGES.cancel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
