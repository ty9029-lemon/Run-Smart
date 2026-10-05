import { useEffect, useState } from 'react';
import { logger } from '../lib/logger';

/** 위치 권한 상태 */
export type LocationStatus = 'granted' | 'denied' | 'prompt' | 'unknown';

/**
 * 브라우저에 위치 권한을 요청한다. (좌표는 사용하지 않고 권한 팝업만 띄움)
 * 결과는 useLocationPermission의 change 이벤트로 반영된다.
 */
export function requestLocationPermission(): void {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    () => logger.info('위치 권한 허용됨'),
    (e) => logger.warn('위치 권한 요청 거부/실패', e),
  );
}

/**
 * 브라우저의 위치 권한 상태를 읽는다.
 * Permissions API를 지원하지 않으면 'unknown'(→ 서울 기준 안내).
 */
export function useLocationPermission(): LocationStatus {
  const [status, setStatus] = useState<LocationStatus>('unknown');
  useEffect(() => {
    if (!navigator.permissions) return;
    let result: PermissionStatus | null = null;
    const sync = () => result && setStatus(result.state);
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((r) => {
        result = r;
        sync();
        r.addEventListener('change', sync);
      })
      .catch((e) => logger.warn('위치 권한 조회 실패', e));
    return () => result?.removeEventListener('change', sync);
  }, []);
  return status;
}
