import { BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { REMINDER_MESSAGES } from '../constants/messages';

interface ReminderInterestButtonProps {
  /** 선택한 시각 라벨 (예: "오후 6시", "내일 오전 7시") */
  hourLabel: string;
  /** 이 시각에 이미 관심을 남겼는지 */
  isRequested: boolean;
  /** 버튼을 눌렀을 때 */
  onRequest: () => void;
}

/**
 * 선택한 시간대의 러닝 알림 수요를 확인하는 버튼.
 * 알림은 아직 없어서, 누르면 준비 중이라는 안내로 바뀐다.
 */
export default function ReminderInterestButton({
  hourLabel,
  isRequested,
  onRequest,
}: ReminderInterestButtonProps) {
  if (isRequested) {
    return (
      <p role="status" className="rounded-[12px] bg-card p-3 text-sm text-muted-foreground">
        {REMINDER_MESSAGES.requested}
      </p>
    );
  }
  return (
    <Button type="button" variant="outline" size="lg" className="w-full" onClick={onRequest}>
      <BellRing aria-hidden="true" />
      {REMINDER_MESSAGES.button(hourLabel)}
    </Button>
  );
}
