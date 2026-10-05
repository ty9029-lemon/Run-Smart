import OffsetSlider from './OffsetSlider';
import { getActivityMeta } from '../constants/activities';
import { setOffset } from '../lib/profileDraft';
import type { Profile } from '../types';

interface OffsetListProps {
  draft: Profile;
  onChange: (next: Profile) => void;
}

/** 선택한 활동별 체감 온도 보정 슬라이더 목록 */
export default function OffsetList({ draft, onChange }: OffsetListProps) {
  return (
    <div className="space-y-5">
      {draft.selectedActivities.map((id) => (
        <OffsetSlider
          key={id}
          label={getActivityMeta(id).label}
          value={draft.offsets[id]}
          onChange={(v) => onChange(setOffset(draft, id, v))}
        />
      ))}
    </div>
  );
}
