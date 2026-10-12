import ActivityChip from './ActivityChip';
import { ACTIVITIES } from '../constants/activities';
import { ACTIVITY_SCREENS } from '../constants/analytics';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import type { Activity } from '../types';

interface ActivityChipsProps {
  selected: Activity | null;
  onSelect: (activity: Activity) => void;
}

/** 오늘 활동 칩 (준비 중인 활동은 비활성으로 보여준다) */
export default function ActivityChips({ selected, onSelect }: ActivityChipsProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="오늘 활동">
      {ACTIVITIES.map(({ id, label, enabled }) => (
        <ActivityChip
          key={id}
          label={label}
          enabled={enabled}
          selected={id === selected}
          onClick={() => onSelect(id)}
          onDisabledClick={() =>
            trackEvent(ANALYTICS_EVENTS.activityDisabledClicked, {
              activity: id,
              screen: ACTIVITY_SCREENS.home,
            })
          }
        />
      ))}
    </div>
  );
}
