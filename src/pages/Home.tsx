import { Link } from 'react-router-dom';
import HomeHeader from '../components/HomeHeader';
import HomeReady from '../components/HomeReady';
import { DEFAULT_LOCATION, MESSAGES } from '../constants/messages';
import { useHomeData } from '../hooks/useHomeData';
import { useLocationPermission } from '../hooks/useLocationPermission';
import { useProfileStore } from '../store/profileStore';
import type { Activity, Profile } from '../types';

/** 오늘 활동을 정한다. 마지막 활동이 선택 목록에 없으면 첫 번째 활동. */
function resolveActivity(profile: Profile): Activity | null {
  const { lastActivity, selectedActivities } = profile;
  if (lastActivity && selectedActivities.includes(lastActivity)) return lastActivity;
  return selectedActivities[0] ?? null;
}

/** 안내 박스 */
function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-panel border border-card-border-ink bg-card-charcoal p-6 text-sm">
      {children}
    </p>
  );
}

/** 홈 (메인 대시보드) */
export default function Home() {
  const profile = useProfileStore((s) => s.profile);
  const locationStatus = useLocationPermission();
  const activity = resolveActivity(profile);
  const offset = activity ? profile.offsets[activity] : 0;
  const data = useHomeData(activity, offset, profile.constraints);

  return (
    <main className="mx-auto max-w-md space-y-6 px-4 py-6">
      <HomeHeader location={DEFAULT_LOCATION} />
      {locationStatus !== 'granted' && <Notice>{MESSAGES.locationDenied}</Notice>}
      {!activity && (
        <Notice>
          {MESSAGES.noActivity}{' '}
          <Link to="/settings" className="text-lime-pulse underline">
            설정으로 이동
          </Link>
        </Notice>
      )}
      {activity && data.status === 'loading' && <Notice>불러오는 중이에요…</Notice>}
      {activity && data.status === 'error' && <Notice>{MESSAGES.weatherFailed}</Notice>}
      {activity && data.status === 'ready' && (
        <HomeReady
          activity={activity}
          profile={profile}
          weather={data.weather}
          guide={data.guide}
        />
      )}
    </main>
  );
}
