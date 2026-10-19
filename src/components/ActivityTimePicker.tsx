import ActivityChip from './ActivityChip';
import { ACTIVITY_TIME_SLOTS } from '../constants/activities';
import type { ActivityTimeSlot } from '../types';

interface ActivityTimePickerProps {
  selected: ActivityTimeSlot[];
  onToggle: (id: ActivityTimeSlot) => void;
}

/** 활동 시간대 선택 */
export default function ActivityTimePicker({ selected, onToggle }: ActivityTimePickerProps) {
  return (
    <div>
      <h2 className="mb-1 text-base font-bold">시간대 선택</h2>
      <p className="mb-3 text-sm text-subtle-text">여러 개 고를 수 있어요.</p>
      <div className="flex flex-wrap gap-2">
        {ACTIVITY_TIME_SLOTS.map(({ id, label }) => (
          <ActivityChip
            key={id}
            label={label}
            enabled
            selected={selected.includes(id)}
            onClick={() => onToggle(id)}
          />
        ))}
      </div>
    </div>
  );
}
