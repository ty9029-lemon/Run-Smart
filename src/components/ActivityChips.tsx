import { getActivityMeta } from '../constants/activities';
import type { Activity } from '../types';

interface ActivityChipsProps {
  activities: Activity[];
  selected: Activity | null;
  onSelect: (activity: Activity) => void;
}

/** 오늘 활동 칩 (프로필에서 고른 활동 중 하나를 선택) */
export default function ActivityChips({
  activities,
  selected,
  onSelect,
}: ActivityChipsProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="오늘 활동">
      {activities.map((id) => {
        const meta = getActivityMeta(id);
        const active = id === selected;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(id)}
            className={`rounded-full border px-5 py-2 text-sm font-medium ${
              active
                ? 'border-lime-pulse bg-lime-pulse text-carbon-black'
                : 'border-steel-border bg-transparent text-pure-white'
            }`}
          >
            {meta.emoji} {meta.label}
          </button>
        );
      })}
    </div>
  );
}
