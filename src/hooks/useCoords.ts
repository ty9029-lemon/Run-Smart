import { useEffect, useState } from 'react';
import {
  GEOLOCATION_MAX_AGE_MS,
  GEOLOCATION_RETRY_COUNT,
  GEOLOCATION_TIMEOUT_MS,
  SEOUL_COORDS,
  type Coords,
} from '../constants/api';
import { logger } from '../lib/logger';
import type { LocationStatus } from './useLocationPermission';

/** 날씨 조회에 쓸 위치 */
export interface ResolvedCoords {
  coords: Coords;
  /** 실제 현재 위치인지(true), 서울 기준 대체값인지(false) */
  isCurrent: boolean;
}

/** 서울 기준 대체 위치 */
const SEOUL_FALLBACK: ResolvedCoords = { coords: SEOUL_COORDS, isCurrent: false };
/** 위치 권한 거부 에러 코드 (GeolocationPositionError.PERMISSION_DENIED) */
const PERMISSION_DENIED_CODE = 1;

/** 현재 위치를 한 번 읽는다. 실패하면 에러를 돌려준다. */
function getPosition(): Promise<Coords | GeolocationPositionError> {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      (e) => resolve(e),
      { timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: GEOLOCATION_MAX_AGE_MS },
    );
  });
}

/** 현재 위치를 읽는다. 시간 초과/확인 불가는 재시도하고, 끝내 실패하면 null. */
async function readPosition(): Promise<Coords | null> {
  if (!navigator.geolocation) return null;
  for (let attempt = 0; attempt <= GEOLOCATION_RETRY_COUNT; attempt += 1) {
    const result = await getPosition();
    if (!('code' in result)) return result;
    logger.warn(`현재 위치를 읽지 못함 (code ${result.code})`, result);
    if (result.code === PERMISSION_DENIED_CODE) return null;
  }
  return null;
}

/**
 * 날씨 조회에 쓸 좌표를 정한다.
 * 권한 상태는 신뢰하지 않고 항상 직접 위치를 읽어 본다.
 * (모바일 브라우저는 Permissions API가 없거나, 사이트 설정을 바꿔도 이전 상태
 * (denied 등)가 남아 있을 수 있다. 거부된 상태면 읽기가 곧바로 실패할 뿐이다.)
 * 서울 기준으로 떨어진 경우, 설정 앱 등에서 돌아오면 다시 시도한다. (PRD 6장)
 * @param status 위치 권한 상태. 바뀔 때마다 다시 읽는다.
 */
export function useCoords(status: LocationStatus): ResolvedCoords | null {
  const [resolved, setResolved] = useState<ResolvedCoords | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const needsRetry = resolved !== null && !resolved.isCurrent;
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const position = await readPosition();
      if (cancelled) return;
      setResolved(position ? { coords: position, isCurrent: true } : SEOUL_FALLBACK);
    })();
    return () => {
      cancelled = true;
    };
  }, [status, retryCount]);
  useEffect(() => {
    if (!needsRetry) return;
    const onVisible = () => {
      if (document.visibilityState === 'visible') setRetryCount((n) => n + 1);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [needsRetry]);
  return resolved;
}
