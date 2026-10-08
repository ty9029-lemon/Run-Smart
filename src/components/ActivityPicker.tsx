import { ACTIVITIES } from '../constants/activities';
import type { Activity } from '../types';

interface ActivityPickerProps {
  selected: Activity[];
  error: string;
  onToggle: (id: Activity) => void;
}

/** 활동 선택 */
export default function ActivityPicker({ selected, error, onToggle }: ActivityPickerProps) {
  return (
    <div>
      <h2 className="mb-1 text-base font-bold">활동 선택</h2>
      <p className="mb-3 text-sm text-steel-border">
        여러 개 고를 수 있어요.
      </p>
      <div className="flex flex-wrap gap-2">
        {ACTIVITIES.map(({ id, label, emoji }) => {
          const on = selected.includes(id);
          return (
            <button
              key={id}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(id)}
              className={`rounded-full border px-5 py-2 text-sm font-medium ${
                on
                  ? 'border-lime-pulse bg-lime-pulse text-carbon-black'
                  : 'border-steel-border text-pure-white'
              }`}
            >
              {emoji} {label}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
