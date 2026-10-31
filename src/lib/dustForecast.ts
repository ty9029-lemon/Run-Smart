import {
  DUST_ADJUST_DECAY_HOURS,
  DUST_FORECAST_MIN_HOURS,
  DUST_FORECAST_MIN_WEIGHT,
  FORECAST_DAYS,
  HOURS_IN_DAY,
  MINUTES_PER_HOUR,
  MS_PER_MINUTE,
  PM10_BAD_MAX,
  PM10_GOOD,
  PM10_NORMAL,
} from '../constants/thresholds';
import type { HourlyWeather } from '../types';
import type { WeatherResult } from './openMeteo';

/** 에어코리아 예보 등급 */
export type ForecastGrade = '좋음' | '보통' | '나쁨' | '매우나쁨';

/** /api/air-forecast 응답. 날짜는 한국 날짜(YYYY-MM-DD) */
export interface AirForecast {
  today: string;
  days: { date: string; grade: ForecastGrade }[];
}

/** 등급별 PM10 하루 평균의 범위(㎍/㎥) [최소, 최대] */
const GRADE_RANGE: Record<ForecastGrade, readonly [number, number]> = {
  좋음: [0, PM10_GOOD],
  보통: [PM10_GOOD + 1, PM10_NORMAL],
  나쁨: [PM10_NORMAL + 1, PM10_BAD_MAX],
  매우나쁨: [PM10_BAD_MAX + 1, Number.POSITIVE_INFINITY],
};

/** 하루(ms) */
const MS_PER_DAY = HOURS_IN_DAY * MINUTES_PER_HOUR * MS_PER_MINUTE;

/** 두 날짜("2026-10-31") 사이의 일수. 둘째가 이후면 양수 */
function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / MS_PER_DAY);
}

/** 지금(nowIndex)에서 멀수록 1에 가까워지는 예보 반영 비율. 지금은 0이라 현재 실측 보정이 그대로 남는다 */
function forecastWeight(index: number, nowIndex: number): number {
  return 1 - Math.exp(-(index - nowIndex) / DUST_ADJUST_DECAY_HOURS);
}

/**
 * 하루의 남은 시간대를 예보 등급의 범위 안으로 맞춘다.
 * 평균이 범위 밖일 때만, 모든 시간대를 같은 만큼(반영 비율을 곱해) 옮겨 시간대별 변화 모양은 유지한다.
 * 반영 비율 때문에 평균이 모자라지 않도록 이동량을 평균 반영 비율로 나눈다.
 */
function fitDayToGrade(
  hourly: HourlyWeather[],
  dayOffset: number,
  nowIndex: number,
  grade: ForecastGrade,
): HourlyWeather[] {
  const indexes = hourly
    .map((_, i) => i)
    .filter((i) => Math.floor(i / HOURS_IN_DAY) === dayOffset && i >= nowIndex)
    .filter((i) => hourly[i].pm10Source !== 'none');
  if (indexes.length < DUST_FORECAST_MIN_HOURS) return hourly;
  const mean = indexes.reduce((sum, i) => sum + hourly[i].pm10, 0) / indexes.length;
  const [min, max] = GRADE_RANGE[grade];
  const gap = Math.min(max, Math.max(min, mean)) - mean;
  if (gap === 0) return hourly;
  const weightMean =
    indexes.reduce((sum, i) => sum + forecastWeight(i, nowIndex), 0) / indexes.length;
  const shift = gap / Math.max(weightMean, DUST_FORECAST_MIN_WEIGHT);
  return hourly.map((slot, i) => {
    if (i === nowIndex || !indexes.includes(i)) return slot;
    const pm10 = Math.max(0, Math.round(slot.pm10 + shift * forecastWeight(i, nowIndex)));
    return { ...slot, pm10, pm10Source: 'adjusted' };
  });
}

/**
 * 시간대별 PM10을 에어코리아 예보 등급에 맞춘다. (예측 모델이 한국 미세먼지를 낮게 추정하는 것을 바로잡는다)
 * 오늘 남은 시간과 내일에 적용하고, 현재 값과 이미 지난 시간대는 건드리지 않는다.
 * @param result 날씨 (현재 실측 보정이 끝난 것)
 * @param forecast 예보 등급. 없으면 원본을 그대로 돌려준다.
 */
export function applyDustForecast(result: WeatherResult, forecast: AirForecast | null): WeatherResult {
  if (!forecast) return result;
  const nowIndex = result.hourly.findIndex((slot) => slot.hour === result.current.hour);
  if (nowIndex < 0) return result;
  let hourly = result.hourly;
  for (const { date, grade } of forecast.days) {
    const dayOffset = daysBetween(forecast.today, date);
    if (dayOffset < 0 || dayOffset >= FORECAST_DAYS) continue;
    hourly = fitDayToGrade(hourly, dayOffset, nowIndex, grade);
  }
  return { ...result, hourly };
}
