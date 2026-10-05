import ActivityPicker from './ActivityPicker';
import ConstraintList from './ConstraintList';
import OffsetList from './OffsetList';
import { toggleActivity, toggleConstraint } from '../lib/profileDraft';
import type { Profile } from '../types';

const SECTION = 'rounded-panel border border-card-border-ink bg-card-charcoal p-6';

interface ProfileFormProps {
  draft: Profile;
  error: string;
  onChange: (next: Profile) => void;
}

/** 설정 폼: 활동 선택, 체감 임계치, 제약사항 */
export default function ProfileForm({ draft, error, onChange }: ProfileFormProps) {
  return (
    <>
      <section className={SECTION}>
        <ActivityPicker
          selected={draft.selectedActivities}
          error={error}
          onToggle={(id) => onChange(toggleActivity(draft, id))}
        />
      </section>
      <section className={`${SECTION} space-y-5`}>
        <h2 className="text-base font-bold">활동별 체감 임계치</h2>
        <OffsetList draft={draft} onChange={onChange} />
      </section>
      <section className={SECTION}>
        <h2 className="mb-3 text-base font-bold">제약사항</h2>
        <ConstraintList
          selected={draft.constraints}
          onToggle={(id) => onChange(toggleConstraint(draft, id))}
        />
      </section>
    </>
  );
}
