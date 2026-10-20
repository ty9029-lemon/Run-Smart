import ActivityChip from './ActivityChip';
import { ACTIVITIES } from '../constants/activities';
import type { ActivityScreen } from '../constants/analytics';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import type { Activity } from '../types';

interface ActivityPickerProps {
  selected: Activity[];
  error: string;
  /** 분석 이벤트에 남길 화면 구분 */
  screen: ActivityScreen;
  onToggle: (id: Activity) => void;
}

/** 활동 선택 */
export default function ActivityPicker({ selected, error, screen, onToggle }: ActivityPickerProps) {
  return (
    <div>
      <h2 className="mb-1 text-base font-bold">활동 선택</h2>
      <p className="mb-3 text-sm text-muted-foreground">
        여러 개 고를 수 있어요.
      </p>
      <div className="flex flex-wrap gap-2">
        {ACTIVITIES.map(({ id, label, enabled }) => (
          <ActivityChip
            key={id}
            label={label}
            enabled={enabled}
            selected={selected.includes(id)}
            onClick={() => onToggle(id)}
            onDisabledClick={() =>
              trackEvent(ANALYTICS_EVENTS.activityDisabledClicked, { activity: id, screen })
            }
          />
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
