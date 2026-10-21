import { Checkbox } from '@/components/ui/checkbox';
import { CONSTRAINTS } from '../constants/activities';
import type { Constraint } from '../types';

interface ConstraintListProps {
  selected: Constraint[];
  onToggle: (id: Constraint) => void;
}

/**
 * 제약사항 체크박스 목록.
 * 모바일에서 잘 눌리도록 체크박스와 글자뿐 아니라 줄 전체(높이 48px)가 라벨이라 어디를 눌러도 토글된다.
 */
export default function ConstraintList({ selected, onToggle }: ConstraintListProps) {
  return (
    <ul>
      {CONSTRAINTS.map(({ id, label }) => {
        const inputId = `constraint-${id}`;
        return (
          <li key={id}>
            <label
              htmlFor={inputId}
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg text-base transition-colors duration-(--motion-duration-fast) ease-(--motion-ease-main) active:bg-foreground/5"
            >
              <Checkbox
                id={inputId}
                checked={selected.includes(id)}
                onCheckedChange={() => onToggle(id)}
              />
              {label}
            </label>
          </li>
        );
      })}
    </ul>
  );
}
