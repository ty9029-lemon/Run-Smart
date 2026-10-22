import ActivityChip from './ActivityChip';
import { ACTIVITY_TIME_SLOTS } from '../constants/activities';
import type { ActivityScreen } from '../constants/analytics';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import type { ActivityTimeSlot } from '../types';

interface ActivityTimePickerProps {
  selected: ActivityTimeSlot[];
  onToggle: (id: ActivityTimeSlot) => void;
  /** 어느 화면의 선택인지 (토글 이벤트 속성) */
  screen: ActivityScreen;
}

/** 활동 시간대 선택 */
export default function ActivityTimePicker({ selected, onToggle, screen }: ActivityTimePickerProps) {
  /** 시간대를 토글하고, 토글 후 선택 상태를 함께 기록한다. */
  const handleToggle = (id: ActivityTimeSlot) => {
    trackEvent(ANALYTICS_EVENTS.timeSlotToggled, {
      slot: id,
      checked: !selected.includes(id),
      screen,
    });
    onToggle(id);
  };
  return (
    <div>
      <h2 className="mb-1 text-base font-bold">시간대 선택</h2>
      <p className="mb-3 text-sm text-muted-foreground">여러 개 고를 수 있어요.</p>
      <div className="flex flex-wrap gap-2">
        {ACTIVITY_TIME_SLOTS.map(({ id, label }) => (
          <ActivityChip
            key={id}
            label={label}
            enabled
            selected={selected.includes(id)}
            onClick={() => handleToggle(id)}
          />
        ))}
      </div>
    </div>
  );
}
