import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LocationStatus from '../components/LocationStatus';
import ProfileForm from '../components/ProfileForm';
import { useLocationPermission } from '../hooks/useLocationPermission';
import { useProfileDraft } from '../hooks/useProfileDraft';
import { useProfileStore } from '../store/profileStore';

/** 설정 (프로필 맞춤) */
export default function Settings() {
  const navigate = useNavigate();
  const saved = useProfileStore((s) => s.profile);
  const locationStatus = useLocationPermission();
  const { draft, error, onChange, submit } = useProfileDraft(saved, () => navigate('/'));

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
      <Button type="button" size="lg" onClick={submit} className="w-full">
        저장
      </Button>
    </main>
  );
}
