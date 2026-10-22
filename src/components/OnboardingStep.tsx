import ActivityPicker from './ActivityPicker';
import ConstraintList from './ConstraintList';
import LocationStatus from './LocationStatus';
import SensitivityList from './SensitivityList';
import { ACTIVITY_SCREENS } from '../constants/analytics';
import type { OnboardingStepId } from '../constants/onboarding';
import type { LocationStatus as LocationPermissionStatus } from '../hooks/useLocationPermission';
import { toggleActivity, toggleConstraint } from '../lib/profileDraft';
import type { Profile } from '../types';

interface OnboardingStepProps {
  step: OnboardingStepId;
  draft: Profile;
  error: string;
  /** 브라우저 위치 권한 상태. 단계 전환 때 재마운트되지 않도록 부모가 구독한다. */
  locationStatus: LocationPermissionStatus;
  onChange: (next: Profile) => void;
}

/** 현재 단계에 맞는 입력 UI를 보여준다. */
export default function OnboardingStep({
  step,
  draft,
  error,
  locationStatus,
  onChange,
}: OnboardingStepProps) {
  switch (step) {
    case 'activity':
      return (
        <ActivityPicker
          selected={draft.selectedActivities}
          error={error}
          screen={ACTIVITY_SCREENS.onboarding}
          onToggle={(id) => onChange(toggleActivity(draft, id))}
        />
      );
    case 'offset':
      return <SensitivityList draft={draft} onChange={onChange} />;
    case 'constraint':
      return (
        <ConstraintList
          selected={draft.constraints}
          screen={ACTIVITY_SCREENS.onboarding}
          onToggle={(id) => onChange(toggleConstraint(draft, id))}
        />
      );
    case 'location':
      return (
        <LocationStatus
          status={locationStatus}
          enabled={draft.useCurrentLocation}
          onEnabledChange={(next) => onChange({ ...draft, useCurrentLocation: next })}
        />
      );
  }
}
