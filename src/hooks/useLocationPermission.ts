import { useEffect, useState } from 'react';
import { GEOLOCATION_MAX_AGE_MS, GEOLOCATION_TIMEOUT_MS } from '../constants/api';
import { logger } from '../lib/logger';

/** 위치 권한 상태 */
export type LocationStatus = 'granted' | 'denied' | 'prompt' | 'unknown';

/** 위치 권한 요청이 성공했음을 알리는 이벤트 이름 */
const LOCATION_GRANTED_EVENT = 'runsmart:location-granted';

/**
 * 브라우저에 위치 권한을 요청한다. (좌표는 사용하지 않고 권한 팝업만 띄움)
 * 성공하면 이벤트로 알려, Permissions API의 change 이벤트가 없는 모바일에서도 반영한다.
 * 이미 거부된 것으로 보여도 실제로 한 번 시도한다. (사이트 설정을 바꾼 뒤에도
 * 이전 상태가 남아 있을 수 있다.)
 * @returns 위치를 읽는 데 성공했는지 여부
 */
export function requestLocationPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(false);
    navigator.geolocation.getCurrentPosition(
      () => {
        logger.info('위치 권한 허용됨');
        window.dispatchEvent(new Event(LOCATION_GRANTED_EVENT));
        resolve(true);
      },
      (e) => {
        logger.warn('위치 권한 요청 거부/실패', e);
        resolve(false);
      },
      { timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: GEOLOCATION_MAX_AGE_MS },
    );
  });
}

/**
 * 브라우저의 위치 권한 상태를 읽는다.
 * Permissions API를 지원하지 않으면 'unknown'(→ 서울 기준 안내).
 */
export function useLocationPermission(): LocationStatus {
  const [status, setStatus] = useState<LocationStatus>('unknown');
  useEffect(() => {
    const onGranted = () => setStatus('granted');
    window.addEventListener(LOCATION_GRANTED_EVENT, onGranted);
    if (!navigator.permissions) {
      return () => window.removeEventListener(LOCATION_GRANTED_EVENT, onGranted);
    }
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
    return () => {
      window.removeEventListener(LOCATION_GRANTED_EVENT, onGranted);
      result?.removeEventListener('change', sync);
    };
  }, []);
  return status;
}
