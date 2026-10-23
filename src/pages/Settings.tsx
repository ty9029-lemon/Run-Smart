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
import { isProfileChanged } from '../lib/profileDraft';
import { useProfileStore } from '../store/profileStore';
import { useThemeStore } from '../store/themeStore';

/** 저장할 때 확정되는 테마와, 이번에 테마를 바꿨는지 기록한다. */
function trackThemeSaved(): void {
  const { mode, previewMode } = useThemeStore.getState();
  trackEvent(ANALYTICS_EVENTS.themeSaved, {
    theme: previewMode ?? mode,
    changed: previewMode !== null && previewMode !== mode,
  });
}

/** 저장하지 않은 테마 미리보기가 저장된 테마와 다른지 확인한다. */
function useIsThemeChanged(): boolean {
  const mode = useThemeStore((s) => s.mode);
  const previewMode = useThemeStore((s) => s.previewMode);
  return previewMode !== null && previewMode !== mode;
}

/** 설정 (프로필 맞춤) */
export default function Settings() {
  const navigate = useNavigate();
  const saved = useProfileStore((s) => s.profile);
  const commitThemePreview = useThemeStore((s) => s.commitPreview);
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
    // 화면을 떠나면 미리보기가 사라지므로 이동 전에 테마를 확정한다
    trackThemeSaved();
    commitThemePreview();
    navigate('/', { state: SETTINGS_SAVED_STATE });
  });

  // 바뀐 것이 없으면 저장 버튼을 막는다. (프로필 초안과 테마 미리보기 모두 확인)
  const isThemeChanged = useIsThemeChanged();
  const hasChanges = isThemeChanged || isProfileChanged(saved, draft);

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
      <Button
        type="button"
        size="lg"
        onClick={handleSave}
        disabled={!hasChanges}
        className="w-full"
      >
        저장
      </Button>
    </main>
  );
}
