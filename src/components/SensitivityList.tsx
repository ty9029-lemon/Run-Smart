import SensitivityScale from './SensitivityScale';
import { setSensitivity } from '../lib/profileDraft';
import type { Profile } from '../types';

interface SensitivityListProps {
  draft: Profile;
  onChange: (next: Profile) => void;
}

/** 추위·더위 민감도 질문 두 개 */
export default function SensitivityList({ draft, onChange }: SensitivityListProps) {
  return (
    <div className="space-y-8">
      <SensitivityScale
        question="추위를 많이 타는 편인가요?"
        value={draft.coldLevel}
        onChange={(level) => onChange(setSensitivity(draft, 'cold', level))}
      />
      <SensitivityScale
        question="더위를 많이 타는 편인가요?"
        value={draft.heatLevel}
        onChange={(level) => onChange(setSensitivity(draft, 'heat', level))}
      />
    </div>
  );
}
