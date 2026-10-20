import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LocationStatus from '../components/LocationStatus';
import ProfileForm from '../components/ProfileForm';
import ThemeSelector from '../components/ThemeSelector';
import { CTA_IDS } from '../constants/analytics';
import { SETTINGS_SAVED_STATE } from '../constants/navigation';
import { useLocationPermission } from '../hooks/useLocationPermission';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import { useProfileDraft } from '../hooks/useProfileDraft';
import { useProfileStore } from '../store/profileStore';

/** 설정 (프로필 맞춤) */
export default function Settings() {
  const navigate = useNavigate();
  const saved = useProfileStore((s) => s.profile);
  const locationStatus = useLocationPermission();
  const { draft, error, onChange, submit } = useProfileDraft(saved, (next) => {
    // 검증을 통과해 실제로 저장된 값만 기록한다
    trackEvent(ANALYTICS_EVENTS.settingsSaved, {
      coldLevel: next.coldLevel,
      heatLevel: next.heatLevel,
      activityCount: next.selectedActivities.length,
      timeSlotCount: next.activityTimeSlots.length,
      constraintCount: next.constraints.length,
      useCurrentLocation: next.useCurrentLocation,
    });
    navigate('/', { state: SETTINGS_SAVED_STATE });
  });

  /** [저장] 클릭을 기록하고 프로필을 저장한다. */
  const handleSave = () => {
    trackEvent(ANALYTICS_EVENTS.ctaClicked, { cta: CTA_IDS.settingsSave });
    submit();
  };

  return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-6">
      <header>
        <h1 className="text-2xl font-bold">설정</h1>
      </header>
      <ProfileForm draft={draft} error={error} onChange={onChange} />
      <ThemeSelector />
      <section className="rounded-panel bg-card p-6">
        <LocationStatus
          status={locationStatus}
          enabled={draft.useCurrentLocation}
          onEnabledChange={(next) => onChange({ ...draft, useCurrentLocation: next })}
          requestOnEnable
        />
      </section>
      <Button type="button" size="lg" onClick={handleSave} className="w-full">
        저장
      </Button>
    </main>
  );
}
