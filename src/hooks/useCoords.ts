import { useEffect, useState } from 'react';
import {
  GEOLOCATION_MAX_AGE_MS,
  GEOLOCATION_RETRY_COUNT,
  GEOLOCATION_TIMEOUT_MS,
  SEOUL_COORDS,
  type Coords,
} from '../constants/api';
import { logger } from '../lib/logger';
import { LOCATION_GRANTED_EVENT } from './useLocationPermission';

/** 위치 읽기 실패 정보 (원인 확인용) */
export interface CoordsError {
  /** GeolocationPositionError 코드 (1 거부, 2 확인 불가, 3 시간 초과, 0 미지원) */
  code: number;
  message: string;
}

/** 날씨 조회에 쓸 위치 */
export interface ResolvedCoords {
  coords: Coords;
  /** 실제 현재 위치인지(true), 서울 기준 대체값인지(false) */
  isCurrent: boolean;
  /** 서울 기준으로 떨어진 이유 (위치 읽기에 실패한 경우만) */
  error?: CoordsError;
}

/** 서울 기준 대체 위치 */
const SEOUL_FALLBACK: ResolvedCoords = { coords: SEOUL_COORDS, isCurrent: false };
/** 위치를 일시적으로 확인할 수 없을 때의 에러 코드 (GeolocationPositionError.POSITION_UNAVAILABLE) */
const POSITION_UNAVAILABLE_CODE = 2;
/** 위치 기능을 쓸 수 없을 때의 에러 */
const UNSUPPORTED_ERROR: CoordsError = { code: 0, message: 'geolocation 미지원' };

/** 현재 위치를 한 번 읽는다. 실패하면 에러를 돌려준다. */
function getPosition(): Promise<Coords | CoordsError> {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      (e) => resolve({ code: e.code, message: e.message }),
      { timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: GEOLOCATION_MAX_AGE_MS },
    );
  });
}

/**
 * 현재 위치를 읽는다. 일시적으로 확인할 수 없을 때만 재시도하고, 끝내 실패하면 에러를 돌려준다.
 * (시간 초과는 권한 팝업이 떠 있는 중일 수 있어, 재시도하면 팝업이 또 뜰 수 있다.)
 */
async function readPosition(): Promise<Coords | CoordsError> {
  if (!navigator.geolocation) return UNSUPPORTED_ERROR;
  let result = await getPosition();
  for (let retry = 0; 'code' in result && retry < GEOLOCATION_RETRY_COUNT; retry += 1) {
    logger.warn(`현재 위치를 읽지 못함 (code ${result.code})`, result);
    if (result.code !== POSITION_UNAVAILABLE_CODE) break;
    result = await getPosition();
  }
  return result;
}

/**
 * 날씨 조회에 쓸 좌표를 정한다.
 * 권한 상태는 신뢰하지 않고 직접 위치를 읽어 본다. 처음 한 번만 읽고(권한 팝업이
 * 두 번 뜨지 않도록), 이후에는 아래 경우에만 다시 읽는다. (PRD 6장)
 * - 권한 요청이 성공했을 때
 * - 서울 기준으로 떨어진 상태에서 설정 앱 등에서 화면으로 돌아왔을 때
 */
export function useCoords(): ResolvedCoords | null {
  const [resolved, setResolved] = useState<ResolvedCoords | null>(null);
  const [readCount, setReadCount] = useState(0);
  const needsRetry = resolved !== null && !resolved.isCurrent;
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await readPosition();
      if (cancelled) return;
      setResolved(
        'code' in result
          ? { ...SEOUL_FALLBACK, error: result }
          : { coords: result, isCurrent: true },
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [readCount]);
  useEffect(() => {
    const reread = () => setReadCount((n) => n + 1);
    const onVisible = () => {
      if (needsRetry && document.visibilityState === 'visible') reread();
    };
    window.addEventListener(LOCATION_GRANTED_EVENT, reread);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener(LOCATION_GRANTED_EVENT, reread);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [needsRetry]);
  return resolved;
}
