import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import HomeHeader from '../components/HomeHeader';
import HomeReady from '../components/HomeReady';
import HomeSkeleton from '../components/HomeSkeleton';
import { isActivityEnabled } from '../constants/activities';
import { CURRENT_LOCATION_LABEL } from '../constants/api';
import { DEFAULT_LOCATION, MESSAGES } from '../constants/messages';
import { SKELETON_DELAY_MS } from '../constants/motion';
import { useCoords } from '../hooks/useCoords';
import { useDelayedFlag } from '../hooks/useDelayedFlag';
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
  const { lastActivity } = profile;
  const selectedActivities = profile.selectedActivities.filter(isActivityEnabled);
  if (lastActivity && selectedActivities.includes(lastActivity)) return lastActivity;
  return selectedActivities[0] ?? null;
}

/** 안내 박스 */
function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-panel bg-card p-6 text-sm">
      {children}
    </p>
  );
}

/** 홈 (메인 대시보드) */
export default function Home() {
  const profile = useProfileStore((s) => s.profile);
  const setUseCurrentLocation = useProfileStore((s) => s.setUseCurrentLocation);
  const locationStatus = useLocationPermission();
  const activity = resolveActivity(profile);
  const { coldLevel, heatLevel, feedbackOffset } = profile;
  const sensitivity = useMemo(
    () => ({ coldLevel, heatLevel, feedbackOffset }),
    [coldLevel, heatLevel, feedbackOffset],
  );
  const location = useCoords(profile.useCurrentLocation);
  const locationLabel = location?.isCurrent ? CURRENT_LOCATION_LABEL : DEFAULT_LOCATION;
  // 헤더에만 주소를 붙인다. AI 가이드 요청에는 locationLabel을 그대로 보내
  // 주소가 도착해도 가이드를 다시 받지 않는다.
  const place = usePlaceLabel(location?.isCurrent ? location.coords : null);
  // 권한이 허용돼도 기기 설정 때문에 위치를 못 읽어 서울 기준이면 안내를 보여준다.
  // 사용자가 직접 껐다면 다시 켤 수 있도록 꺼짐 안내와 버튼을 보여준다.
  const isLocationOff = !profile.useCurrentLocation;
  const showLocationNotice =
    isLocationOff || locationStatus !== 'granted' || location?.isCurrent === false;

  /**
   * 위치 권한을 요청한다. 꺼 둔 상태였다면 권한을 받은 뒤에 다시 켠다.
   * (먼저 켜면 위치 읽기와 권한 요청이 겹쳐 팝업이 두 번 요청된다.)
   */
  const handleRequestLocation = async () => {
    const granted = await requestLocationPermission();
    if (granted && isLocationOff) setUseCurrentLocation(true);
    return granted;
  };
  const headerLabel = place ? `${locationLabel} (${place})` : locationLabel;
  const data = useHomeData({
    activity,
    sensitivity,
    constraints: profile.constraints,
    location,
    locationLabel,
  });

  // 로딩이 짧으면(캐시 적중 등) 스켈레톤 없이 바로 보여주고, 오래 걸릴 때만 스켈레톤을 보여준다.
  const isLoading = Boolean(activity) && data.status === 'loading';
  const isSkeletonVisible = useDelayedFlag(isLoading, SKELETON_DELAY_MS);
  // 스켈레톤을 본 적이 있으면 실제 화면은 떠오르지 않고 제자리에서 페이드로 나타난다.
  const [hasSeenSkeleton, setHasSeenSkeleton] = useState(false);
  if (isSkeletonVisible && !hasSeenSkeleton) setHasSeenSkeleton(true);

  // 위치 권한이 거부된 상태로 홈을 보면 한 번 기록
  useEffect(() => {
    if (!profile.useCurrentLocation || locationStatus !== 'denied') return;
    trackEvent(ANALYTICS_EVENTS.dataLoadFailed, {
      reason: 'location',
      locationStatus,
    });
  }, [locationStatus, profile.useCurrentLocation]);

  return (
    <main className="mx-auto max-w-md space-y-6 px-4 py-6">
      <HomeHeader location={headerLabel} />
      {!activity && (
        <Notice>
          {MESSAGES.noActivity}{' '}
          <Link to="/settings" className="text-highlight underline">
            설정으로 이동
          </Link>
        </Notice>
      )}
      {isSkeletonVisible && <HomeSkeleton />}
      {activity && data.status === 'error' && <Notice>{MESSAGES.weatherFailed}</Notice>}
      {activity && data.status === 'ready' && (
        <HomeReady
          activity={activity}
          profile={profile}
          weather={data.weather}
          guide={data.guide}
          afterSkeleton={hasSeenSkeleton}
          location={
            showLocationNotice
              ? {
                  status: locationStatus,
                  error: location?.error,
                  onRequest: handleRequestLocation,
                  isOff: isLocationOff,
                }
              : undefined
          }
        />
      )}
    </main>
  );
}
