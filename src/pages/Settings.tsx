import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LocationStatus from '../components/LocationStatus';
import ProfileForm from '../components/ProfileForm';
import { CTA_IDS } from '../constants/analytics';
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
      constraintCount: next.constraints.length,
    });
    navigate('/');
  });

  /** [저장] 클릭을 기록하고 프로필을 저장한다. */
  const handleSave = () => {
    trackEvent(ANALYTICS_EVENTS.ctaClicked, { cta: CTA_IDS.settingsSave });
    submit();
  };

  return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">설정</h1>
        <Link to="/" className="text-sm text-steel-border">
          ← 홈
        </Link>
      </header>
      <ProfileForm draft={draft} error={error} onChange={onChange} />
      <section className="rounded-panel border border-card-border-ink bg-card-charcoal p-6">
        <LocationStatus status={locationStatus} />
      </section>
      <Button type="button" size="lg" onClick={handleSave} className="w-full">
        저장
      </Button>
    </main>
  );
}
