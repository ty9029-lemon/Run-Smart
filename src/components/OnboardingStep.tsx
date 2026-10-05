import ActivityPicker from './ActivityPicker';
import ConstraintList from './ConstraintList';
import LocationStatus from './LocationStatus';
import OffsetList from './OffsetList';
import type { OnboardingStepId } from '../constants/onboarding';
import {
  requestLocationPermission,
  useLocationPermission,
} from '../hooks/useLocationPermission';
import { toggleActivity, toggleConstraint } from '../lib/profileDraft';
import type { Profile } from '../types';

interface OnboardingStepProps {
  step: OnboardingStepId;
  draft: Profile;
  error: string;
  onChange: (next: Profile) => void;
}

/** 현재 단계에 맞는 입력 UI를 보여준다. */
export default function OnboardingStep({
  step,
  draft,
  error,
  onChange,
}: OnboardingStepProps) {
  const locationStatus = useLocationPermission();
  switch (step) {
    case 'activity':
      return (
        <ActivityPicker
          selected={draft.selectedActivities}
          error={error}
          onToggle={(id) => onChange(toggleActivity(draft, id))}
        />
      );
    case 'offset':
      return <OffsetList draft={draft} onChange={onChange} />;
    case 'constraint':
      return (
        <ConstraintList
          selected={draft.constraints}
          onToggle={(id) => onChange(toggleConstraint(draft, id))}
        />
      );
    case 'location':
      return <LocationStatus status={locationStatus} onRequest={requestLocationPermission} />;
  }
}
