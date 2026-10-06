import { useEffect, useState } from 'react';
import { PLACE_COORD_DIGITS, type Coords } from '../constants/api';
import { logger } from '../lib/logger';
import { fetchPlaceLabel } from '../services/placeService';

/** 어떤 좌표에 대한 결과인지 함께 저장해, 좌표가 바뀌면 이전 주소를 쓰지 않게 한다. */
interface Keyed {
  key: string;
  label: string | null;
}

/**
 * 현재 위치의 행정동 이름을 조회한다. (카카오 정책상 결과는 메모리에만 두고 저장하지 않는다)
 * 좌표가 없거나 조회 중이거나 실패하면 null이다.
 * @param coords 현재 위치 좌표 (서울 기준 대체 위치면 null을 넘긴다)
 */
export function usePlaceLabel(coords: Coords | null): string | null {
  const [state, setState] = useState<Keyed | null>(null);
  const lat = coords?.lat;
  const lon = coords?.lon;
  const key =
    lat === undefined || lon === undefined
      ? null
      : `${lat.toFixed(PLACE_COORD_DIGITS)},${lon.toFixed(PLACE_COORD_DIGITS)}`;
  useEffect(() => {
    if (key === null || lat === undefined || lon === undefined) return;
    let cancelled = false;
    fetchPlaceLabel({ lat, lon }).then(
      (label) => {
        if (!cancelled) setState({ key, label });
      },
      (e) => {
        logger.warn('주소 조회 실패', e);
        if (!cancelled) setState({ key, label: null });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [key, lat, lon]);
  return state && state.key === key ? state.label : null;
}
