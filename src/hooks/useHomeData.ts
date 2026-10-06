import { useEffect, useMemo, useState } from 'react';
import { buildGuideRequest, fetchGuide } from '../services/guideService';
import { fetchWeather, type WeatherResult } from '../services/weatherService';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import { logger } from '../lib/logger';
import type { ResolvedCoords } from './useCoords';
import type { Activity, Constraint, GuideRequest, GuideState } from '../types';

/** 홈 화면 데이터 상태. 날씨가 오면 바로 ready가 되고 가이드는 따로 기다린다. */
export type HomeData =
  | { status: 'loading' }
  /** 날씨 조회 실패 */
  | { status: 'error' }
  | { status: 'ready'; weather: WeatherResult; guide: GuideState };

/** 조회 입력 */
interface HomeDataParams {
  activity: Activity | null;
  offset: number;
  constraints: Constraint[];
  /** 날씨를 조회할 위치 (권한 확인 중이면 null) */
  location: ResolvedCoords | null;
  /** AI에게 알려줄 위치 이름 */
  locationLabel: string;
}

/** 어떤 입력에 대한 결과인지 함께 저장해, 입력이 바뀌면 이전 결과를 쓰지 않게 한다. */
interface Keyed<T> {
  key: string;
  value: T;
}

/** 날씨를 조회한다. 위치가 정해지기 전이거나 조회 중이면 null, 실패면 'error'. */
function useWeather(lat?: number, lon?: number): WeatherResult | 'error' | null {
  const [state, setState] = useState<Keyed<WeatherResult | 'error'> | null>(null);
  const key = lat === undefined || lon === undefined ? null : `${lat},${lon}`;
  useEffect(() => {
    if (key === null || lat === undefined || lon === undefined) return;
    let cancelled = false;
    fetchWeather({ lat, lon }).then(
      (value) => {
        if (!cancelled) setState({ key, value });
      },
      (e) => {
        logger.error('날씨 조회 실패', e);
        if (cancelled) return;
        trackEvent(ANALYTICS_EVENTS.dataLoadFailed, { reason: 'weather' });
        setState({ key, value: 'error' });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [key, lat, lon]);
  return state && state.key === key ? state.value : null;
}

/** AI 가이드를 조회한다. 요청이 바뀌면 이전 가이드를 버리고 곧바로 loading이 된다. */
function useGuide(request: GuideRequest | null): GuideState {
  const [state, setState] = useState<Keyed<GuideState> | null>(null);
  const key = request ? JSON.stringify(request) : null;
  useEffect(() => {
    if (!request || key === null) return;
    let cancelled = false;
    fetchGuide(request).then(
      (data) => {
        if (!cancelled) setState({ key, value: { state: 'ready', data } });
      },
      (e) => {
        logger.error('AI 가이드 조회 실패', e);
        if (cancelled) return;
        trackEvent(ANALYTICS_EVENTS.dataLoadFailed, { reason: 'guide' });
        setState({ key, value: { state: 'failed' } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [request, key]);
  return state && state.key === key ? state.value : { state: 'loading' };
}

/**
 * 홈 화면에 필요한 날씨와 AI 가이드를 불러온다.
 * 활동이나 위치가 정해지기 전에는 로딩 상태를 유지한다.
 */
export function useHomeData(params: HomeDataParams): HomeData {
  const { activity, offset, constraints, location, locationLabel } = params;
  const weather = useWeather(
    activity ? location?.coords.lat : undefined,
    activity ? location?.coords.lon : undefined,
  );
  const current = weather && weather !== 'error' ? weather.current : null;
  const request = useMemo(() => {
    if (!activity || !current) return null;
    return buildGuideRequest({
      activity,
      offset,
      constraints,
      weather: current,
      location: locationLabel,
    });
  }, [activity, offset, constraints, current, locationLabel]);
  const guide = useGuide(request);
  if (!activity || weather === null) return { status: 'loading' };
  if (weather === 'error') return { status: 'error' };
  return { status: 'ready', weather, guide };
}
