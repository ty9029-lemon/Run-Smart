import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SETTINGS_CONFIRM_MESSAGES } from '../constants/messages';
import { useProfileStore } from '../store/profileStore';
import ConfirmActionDialog from './ConfirmActionDialog';

interface FeedbackOffsetSectionProps {
  className?: string;
}

/**
 * 보정값(°C)을 사용자에게 보여줄 문구로 바꾼다.
 * @param offset 피드백 누적 보정값
 */
function describeOffset(offset: number): string {
  if (offset === 0) return '아직 반영된 피드백이 없어요.';
  const sign = offset > 0 ? '+' : '';
  const direction = offset < 0 ? '더 따뜻하게' : '더 시원하게';
  return `피드백으로 ${sign}${offset.toFixed(1)}°C 보정해 ${direction} 추천하고 있어요.`;
}

/** 설정 화면: 피드백으로 학습한 보정 현황과 초기화 버튼(누르면 확인 팝업을 거친다) */
export default function FeedbackOffsetSection({ className }: FeedbackOffsetSectionProps) {
  const offset = useProfileStore((s) => s.profile.feedbackOffset);
  const reset = useProfileStore((s) => s.resetFeedbackOffset);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleConfirm = () => {
    reset();
    setIsConfirmOpen(false);
  };

  return (
    <section className={`${className ?? ''} space-y-3`}>
      <h2 className="text-base font-bold">피드백 보정</h2>
      <p className="text-sm text-muted-foreground">{describeOffset(offset)}</p>
      {offset !== 0 && (
        <Button type="button" variant="secondary" size="sm" onClick={() => setIsConfirmOpen(true)}>
          보정 초기화
        </Button>
      )}
      <ConfirmActionDialog
        open={isConfirmOpen}
        title={SETTINGS_CONFIRM_MESSAGES.resetTitle}
        description={SETTINGS_CONFIRM_MESSAGES.resetDescription}
        cancelLabel={SETTINGS_CONFIRM_MESSAGES.resetCancel}
        confirmLabel={SETTINGS_CONFIRM_MESSAGES.resetConfirm}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
      />
    </section>
  );
}
