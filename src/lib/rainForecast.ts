import {
  DRY_FALLBACK_CONDITION,
  FORECAST_DAYS,
  HOURS_IN_DAY,
  MINUTES_PER_HOUR,
  MS_PER_MINUTE,
  PRECIPITATION_CONDITIONS,
} from '../constants/thresholds';
import type { HourlyWeather } from '../types';
import type { WeatherResult } from './openMeteo';

/** 강수 형태 (기상청 PTY를 비·눈·소나기로 줄인 것) */
export type RainKind = 'none' | 'rain' | 'snow' | 'shower';

/** 기상청 예보의 한 시간. 날짜는 한국 날짜(YYYY-MM-DD) */
export interface RainForecastHour {
  date: string;
  hour: number;
  /** 1시간 강수량(mm) */
  precipitation: number;
  kind: RainKind;
}

/** /api/rain-forecast 응답 */
export interface RainForecast {
  /** 서버가 본 오늘(한국 날짜) */
  today: string;
  hours: RainForecastHour[];
}

/** 예보 강수 형태 → 날씨 상태 */
const KIND_CONDITION: Record<Exclude<RainKind, 'none'>, string> = {
  rain: '비',
  snow: '눈',
  shower: '소나기',
};
/** 하루(ms) */
const MS_PER_DAY = HOURS_IN_DAY * MINUTES_PER_HOUR * MS_PER_MINUTE;

/** 소수 첫째 자리로 반올림 */
function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** 날짜("2026-11-01")에 일수를 더한다. */
function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * MS_PER_DAY).toISOString().slice(0, 10);
}

/**
 * 예보에 맞춰 한 시간대의 강수량과 날씨 상태를 바로잡는다.
 * 예보가 비·눈이면 모델이 아니라고 해도 그렇게 보고, 예보가 강수 없음이면 모델의 비 상태를 거둔다.
 */
function applyHour(slot: HourlyWeather, forecast: RainForecastHour): HourlyWeather {
  const precipitation = round1(forecast.precipitation);
  const modelRainy = PRECIPITATION_CONDITIONS.has(slot.condition);
  let { condition } = slot;
  if (forecast.kind !== 'none' && !modelRainy) condition = KIND_CONDITION[forecast.kind];
  if (forecast.kind === 'none' && precipitation === 0 && modelRainy) {
    condition = DRY_FALLBACK_CONDITION;
  }
  return { ...slot, precipitation, condition };
}

/**
 * 시간대별 강수를 기상청 예보로 바꾼다. (예측 모델이 한국의 강수량을 낮게 추정하는 것을 바로잡는다)
 * 지금 시각 이후 시간대 중 예보가 있는 시간만 바꾸고, 이미 지난 시간대와 예보가 없는 시간대는 그대로 둔다.
 * 현재 날씨(실측)는 건드리지 않는다.
 * @param result 날씨
 * @param forecast 기상청 강수 예보. 없으면 원본을 그대로 돌려준다.
 */
export function applyRainForecast(
  result: WeatherResult,
  forecast: RainForecast | null,
): WeatherResult {
  if (!forecast || forecast.hours.length === 0) return result;
  const nowIndex = result.hourly.findIndex((slot) => slot.hour === result.current.hour);
  if (nowIndex < 0) return result;
  const byKey = new Map(forecast.hours.map((h) => [`${h.date}#${h.hour}`, h]));
  const hourly = result.hourly.map((slot, i) => {
    const dayOffset = Math.floor(i / HOURS_IN_DAY);
    if (i < nowIndex || dayOffset >= FORECAST_DAYS) return slot;
    const hit = byKey.get(`${addDays(forecast.today, dayOffset)}#${slot.hour}`);
    return hit ? applyHour(slot, hit) : slot;
  });
  return { ...result, hourly };
}
