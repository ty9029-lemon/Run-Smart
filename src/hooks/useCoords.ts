import { useEffect, useState } from 'react';
import { GEOLOCATION_TIMEOUT_MS, SEOUL_COORDS, type Coords } from '../constants/api';
import { logger } from '../lib/logger';
import type { LocationStatus } from './useLocationPermission';

/** 날씨 조회에 쓸 위치 */
export interface ResolvedCoords {
  coords: Coords;
  /** 실제 현재 위치인지(true), 서울 기준 대체값인지(false) */
  isCurrent: boolean;
}

/** 권한 상태 확인을 기다리는 최대 시간(ms) */
const PERMISSION_WAIT_MS = 1500;
/** 서울 기준 대체 위치 */
const SEOUL_FALLBACK: ResolvedCoords = { coords: SEOUL_COORDS, isCurrent: false };

/** 현재 위치를 한 번 읽는다. 실패하면 null. */
function readPosition(): Promise<Coords | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      (e) => {
        logger.warn('현재 위치를 읽지 못해 서울 기준으로 대체', e);
        resolve(null);
      },
      { timeout: GEOLOCATION_TIMEOUT_MS },
    );
  });
}

/**
 * 날씨 조회에 쓸 좌표를 정한다.
 * 위치 권한이 허용돼 있으면 현재 위치, 아니면 서울 기준. (PRD 6장)
 * 권한 상태를 확인하는 동안에는 null을 돌려준다.
 * @param status 위치 권한 상태
 */
export function useCoords(status: LocationStatus): ResolvedCoords | null {
  const [resolved, setResolved] = useState<ResolvedCoords | null>(null);
  useEffect(() => {
    // Permissions API가 있는데 아직 상태를 모르면 확인이 끝날 때까지 기다린다.
    const pending = status === 'unknown' && Boolean(navigator.permissions);
    if (pending) {
      // 권한 조회가 실패해 상태가 끝내 'unknown'이면 서울 기준으로 진행한다.
      const timer = setTimeout(() => setResolved(SEOUL_FALLBACK), PERMISSION_WAIT_MS);
      return () => clearTimeout(timer);
    }
    let cancelled = false;
    (async () => {
      const position = status === 'granted' ? await readPosition() : null;
      if (cancelled) return;
      setResolved(position ? { coords: position, isCurrent: true } : SEOUL_FALLBACK);
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);
  return resolved;
}
