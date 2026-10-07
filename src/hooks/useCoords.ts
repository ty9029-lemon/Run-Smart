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
 * 권한 상태는 힌트로만 쓴다. 거부(denied)가 아니면 직접 위치를 읽어 본다.
 * (모바일 브라우저는 Permissions API가 없거나 변경 이벤트가 오지 않을 수 있다.)
 * 실패하면 서울 기준. (PRD 6장)
 * @param status 위치 권한 상태
 */
export function useCoords(status: LocationStatus): ResolvedCoords | null {
  const [resolved, setResolved] = useState<ResolvedCoords | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const position = status === 'denied' ? null : await readPosition();
      if (cancelled) return;
      setResolved(position ? { coords: position, isCurrent: true } : SEOUL_FALLBACK);
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);
  return resolved;
}
