import { Checkbox } from '@/components/ui/checkbox';
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
      {CONSTRAINTS.map(({ id, label }) => {
        const inputId = `constraint-${id}`;
        return (
          <li key={id} className="flex items-center gap-3">
            <Checkbox
              id={inputId}
              checked={selected.includes(id)}
              onCheckedChange={() => onToggle(id)}
            />
            <label htmlFor={inputId} className="text-base">
              {label}
            </label>
          </li>
        );
      })}
    </ul>
  );
}
