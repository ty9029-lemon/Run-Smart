import { BellRing } from 'lucide-react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ACTIVITY_SCREENS, SECTION_IDS } from '../constants/analytics';
import { REMINDER_MESSAGES } from '../constants/messages';
import { useSectionViewed } from '../hooks/useSectionViewed';
import type { Activity } from '../types';

interface ReminderInterestButtonProps {
  /** 선택한 시각 라벨 (예: "오후 6시", "내일 오전 7시") */
  hourLabel: string;
  /** 이 시각에 이미 관심을 남겼는지 */
  isRequested: boolean;
  /** 버튼을 눌렀을 때 */
  onRequest: () => void;
  /** 현재 선택한 활동 (노출 이벤트 속성) */
  activity: Activity;
}

/**
 * 선택한 시간대의 러닝 알림 수요를 확인하는 버튼.
 * 알림은 아직 없어서, 누르면 준비 중이라는 안내로 바뀐다.
 */
export default function ReminderInterestButton({
  hourLabel,
  isRequested,
  onRequest,
  activity,
}: ReminderInterestButtonProps) {
  if (isRequested) {
    return (
      <p role="status" className="rounded-[12px] bg-card p-3 text-sm text-muted-foreground">
        {REMINDER_MESSAGES.requested}
      </p>
    );
  }
  return <RequestButton hourLabel={hourLabel} onRequest={onRequest} activity={activity} />;
}

/** 알림 받기 버튼. 일정 비율·시간 이상 보이면 노출 이벤트를 한 번 보낸다. (클릭률의 분모) */
function RequestButton({
  hourLabel,
  onRequest,
  activity,
}: Pick<ReminderInterestButtonProps, 'hourLabel' | 'onRequest' | 'activity'>) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  useSectionViewed(buttonRef, SECTION_IDS.hourReminder, {
    screen: ACTIVITY_SCREENS.home,
    activity,
  });
  return (
    <Button
      ref={buttonRef}
      type="button"
      variant="outline"
      size="lg"
      className="w-full"
      onClick={onRequest}
    >
      <BellRing aria-hidden="true" />
      {REMINDER_MESSAGES.button(hourLabel)}
    </Button>
  );
}
