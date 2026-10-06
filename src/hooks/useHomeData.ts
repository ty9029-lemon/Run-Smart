import { useEffect, useState } from 'react';
import { fetchGuide } from '../services/guideService';
import { fetchWeather, type WeatherResult } from '../services/weatherService';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import { logger } from '../lib/logger';
import type { Activity, AiGuide, Constraint } from '../types';

/** 홈 화면 데이터 상태 */
export type HomeData =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; weather: WeatherResult; guide: AiGuide };

/**
 * 홈 화면에 필요한 날씨와 AI 가이드를 불러온다.
 * @param activity 선택한 활동 (없으면 로딩 상태 유지)
 * @param offset 활동별 체감 온도 보정값
 * @param constraints 제약사항
 */
export function useHomeData(
  activity: Activity | null,
  offset: number,
  constraints: Constraint[],
): HomeData {
  const [data, setData] = useState<HomeData>({ status: 'loading' });
  useEffect(() => {
    if (!activity) return;
    let cancelled = false;
    (async () => {
      // 실패 시 어느 단계인지 구분하기 위한 표시
      let stage: 'weather' | 'guide' = 'weather';
      try {
        const weather = await fetchWeather();
        stage = 'guide';
        const guide = await fetchGuide({
          activity,
          offset,
          constraints,
          weather: weather.current,
        });
        if (!cancelled) setData({ status: 'ready', weather, guide });
      } catch (e) {
        logger.error('홈 데이터 조회 실패', e);
        if (cancelled) return;
        trackEvent(ANALYTICS_EVENTS.dataLoadFailed, { reason: stage });
        setData({ status: 'error' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activity, offset, constraints]);
  return data;
}
