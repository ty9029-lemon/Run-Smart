import { useEffect, useState } from 'react';
import { fetchGuide } from '../services/guideService';
import { fetchWeather, type WeatherResult } from '../services/weatherService';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import { logger } from '../lib/logger';
import type { ResolvedCoords } from './useCoords';
import type { Activity, AiGuide, Constraint } from '../types';

/** 홈 화면 데이터 상태 */
export type HomeData =
  | { status: 'loading' }
  /** 날씨 조회 실패 */
  | { status: 'error' }
  /** 날씨는 받았지만 AI 가이드가 끝내 실패 → 원시 날씨만 보여준다 (PRD 6장) */
  | { status: 'guideFailed'; weather: WeatherResult }
  | { status: 'ready'; weather: WeatherResult; guide: AiGuide };

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

/**
 * 홈 화면에 필요한 날씨와 AI 가이드를 불러온다.
 * 활동이나 위치가 정해지기 전에는 로딩 상태를 유지한다.
 */
export function useHomeData(params: HomeDataParams): HomeData {
  const { activity, offset, constraints, location, locationLabel } = params;
  const lat = location?.coords.lat;
  const lon = location?.coords.lon;
  const [data, setData] = useState<HomeData>({ status: 'loading' });
  useEffect(() => {
    if (!activity || lat === undefined || lon === undefined) return;
    let cancelled = false;
    (async () => {
      let weather: WeatherResult;
      try {
        weather = await fetchWeather({ lat, lon });
      } catch (e) {
        logger.error('날씨 조회 실패', e);
        if (cancelled) return;
        trackEvent(ANALYTICS_EVENTS.dataLoadFailed, { reason: 'weather' });
        setData({ status: 'error' });
        return;
      }
      try {
        const guide = await fetchGuide({
          activity,
          offset,
          constraints,
          weather: weather.current,
          location: locationLabel,
        });
        if (!cancelled) setData({ status: 'ready', weather, guide });
      } catch (e) {
        logger.error('AI 가이드 조회 실패', e);
        if (cancelled) return;
        trackEvent(ANALYTICS_EVENTS.dataLoadFailed, { reason: 'guide' });
        setData({ status: 'guideFailed', weather });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activity, offset, constraints, lat, lon, locationLabel]);
  return data;
}
