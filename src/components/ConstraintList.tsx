import { CONSTRAINTS } from '../constants/activities';
import type { Constraint } from '../types';

interface ConstraintListProps {
  selected: Constraint[];
  onToggle: (id: Constraint) => void;
}

/** 제약사항 체크박스 목록 */
export default function ConstraintList({ selected, onToggle }: ConstraintListProps) {
  return (
    <ul className="space-y-3">
      {CONSTRAINTS.map(({ id, label }) => (
        <li key={id}>
          <label className="flex items-center gap-3 text-base">
            <input
              type="checkbox"
              checked={selected.includes(id)}
              onChange={() => onToggle(id)}
              className="size-5 accent-lime-pulse"
            />
            {label}
          </label>
        </li>
      ))}
    </ul>
  );
}
