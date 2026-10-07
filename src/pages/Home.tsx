import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import HomeHeader from '../components/HomeHeader';
import HomeReady from '../components/HomeReady';
import { CURRENT_LOCATION_LABEL } from '../constants/api';
import { DEFAULT_LOCATION, MESSAGES } from '../constants/messages';
import { useCoords } from '../hooks/useCoords';
import { useHomeData } from '../hooks/useHomeData';
import {
  requestLocationPermission,
  useLocationPermission,
} from '../hooks/useLocationPermission';
import { usePlaceLabel } from '../hooks/usePlaceLabel';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
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

/** 주소에 ?debug=1이 있으면 위치 진단 정보를 보여준다. (실기기 원인 확인용) */
function isDebugMode(): boolean {
  return new URLSearchParams(window.location.search).get('debug') === '1';
}

/** 홈 (메인 대시보드) */
export default function Home() {
  const profile = useProfileStore((s) => s.profile);
  const locationStatus = useLocationPermission();
  const activity = resolveActivity(profile);
  const offset = activity ? profile.offsets[activity] : 0;
  const location = useCoords();
  const locationLabel = location?.isCurrent ? CURRENT_LOCATION_LABEL : DEFAULT_LOCATION;
  // 헤더에만 주소를 붙인다. AI 가이드 요청에는 locationLabel을 그대로 보내
  // 주소가 도착해도 가이드를 다시 받지 않는다.
  const place = usePlaceLabel(location?.isCurrent ? location.coords : null);
  const headerLabel = place ? `${locationLabel} (${place})` : locationLabel;
  const data = useHomeData({
    activity,
    offset,
    constraints: profile.constraints,
    location,
    locationLabel,
  });

  // 위치 권한이 거부된 상태로 홈을 보면 한 번 기록
  useEffect(() => {
    if (locationStatus !== 'denied') return;
    trackEvent(ANALYTICS_EVENTS.dataLoadFailed, {
      reason: 'location',
      locationStatus,
    });
  }, [locationStatus]);

  return (
    <main className="mx-auto max-w-md space-y-6 px-4 py-6">
      <HomeHeader location={headerLabel} />
      {isDebugMode() && (
        <p className="text-xs text-steel-border">
          위치 진단: 권한={locationStatus} / 오류={location?.error?.code ?? '없음'}{' '}
          {location?.error?.message} / HTTPS={String(window.isSecureContext)}
        </p>
      )}
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
          location={
            locationStatus === 'granted'
              ? undefined
              : { status: locationStatus, onRequest: requestLocationPermission }
          }
        />
      )}
    </main>
  );
}
