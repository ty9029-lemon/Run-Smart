import { describe, expect, it } from 'vitest';
import type { HourlyWeather } from '../types';
import { applyDustForecast, type AirForecast } from './dustForecast';
import type { WeatherResult } from './openMeteo';

/** 시간대마다 반올림하는 오차 허용치(㎍/㎥) */
const ROUNDING = 1;

/** 지금 시각(시). 오늘 남은 시간대가 충분하도록 아침으로 둔다 */
const NOW_HOUR = 10;

/** 시간대별 PM10을 정하는 함수로 48시간 날씨를 만든다. */
function makeResult(pm10Of: (index: number) => number, nowHour = NOW_HOUR): WeatherResult {
  const hourly = Array.from({ length: 48 }, (_, i): HourlyWeather => ({
    hour: i % 24,
    temp: 12,
    humidity: 45,
    windSpeed: 2,
    precipitation: 0,
    condition: '맑음',
    pm10: pm10Of(i),
    pm10Source: 'model',
    uvIndex: 2,
    isDay: true,
  }));
  return { current: { ...hourly[nowHour], pm10Source: 'observed' }, hourly };
}

/** 오늘과 내일의 예보 등급을 만든다. */
function forecastOf(today: ForecastGradeInput, tomorrow: ForecastGradeInput): AirForecast {
  return {
    today: '2026-10-31',
    days: [
      { date: '2026-10-31', grade: today },
      { date: '2026-11-01', grade: tomorrow },
    ],
  };
}
type ForecastGradeInput = AirForecast['days'][number]['grade'];

/** 한 날(0=오늘, 1=내일)의 [from, to) 시간대 평균 PM10 */
function meanOf(result: WeatherResult, from: number, to: number): number {
  const values = result.hourly.slice(from, to).map((h) => h.pm10);
  return values.reduce((a, b) => a + b, 0) / values.length;
}

describe('applyDustForecast', () => {
  it('예보가 없으면 원본을 그대로 돌려준다', () => {
    const base = makeResult(() => 20);
    expect(applyDustForecast(base, null)).toBe(base);
  });

  it('내일 예보가 나쁨인데 모델이 낮으면 내일 평균을 나쁨 범위(81 이상)로 올린다', () => {
    const base = makeResult(() => 20);
    const merged = applyDustForecast(base, forecastOf('좋음', '나쁨'));
    expect(meanOf(merged, 24, 48)).toBeGreaterThanOrEqual(81 - ROUNDING);
    expect(merged.hourly[30].pm10Source).toBe('adjusted');
  });

  it('시간대별 변화 모양은 유지한다', () => {
    const base = makeResult((i) => 20 + (i % 24));
    const merged = applyDustForecast(base, forecastOf('좋음', '나쁨'));
    const shift = merged.hourly[36].pm10 - base.hourly[36].pm10;
    for (const i of [30, 40, 47]) {
      expect(Math.abs(merged.hourly[i].pm10 - base.hourly[i].pm10 - shift)).toBeLessThanOrEqual(2);
    }
  });

  it('예보가 좋음인데 모델이 높으면 평균을 좋음 범위(30 이하)로 내린다', () => {
    const base = makeResult(() => 70);
    const merged = applyDustForecast(base, forecastOf('보통', '좋음'));
    expect(meanOf(merged, 24, 48)).toBeLessThanOrEqual(30 + ROUNDING);
  });

  it('매우나쁨이면 평균을 151 이상으로 올린다', () => {
    const merged = applyDustForecast(makeResult(() => 20), forecastOf('좋음', '매우나쁨'));
    expect(meanOf(merged, 24, 48)).toBeGreaterThanOrEqual(151 - ROUNDING);
  });

  it('평균이 이미 예보 범위 안이면 값을 바꾸지 않는다', () => {
    const base = makeResult(() => 50);
    const merged = applyDustForecast(base, forecastOf('보통', '보통'));
    expect(merged.hourly).toBe(base.hourly);
  });

  it('지금 시각과 이미 지난 시간대는 바꾸지 않는다', () => {
    const base = makeResult(() => 20);
    const merged = applyDustForecast(base, forecastOf('나쁨', '나쁨'));
    expect(merged.hourly[NOW_HOUR]).toBe(base.hourly[NOW_HOUR]);
    expect(merged.hourly[3]).toBe(base.hourly[3]);
    expect(merged.current).toBe(base.current);
  });

  it('지금과 가까운 시간대는 반영을 적게, 먼 시간대는 많이 한다', () => {
    const base = makeResult(() => 20);
    const merged = applyDustForecast(base, forecastOf('나쁨', '나쁨'));
    const gap = (i: number) => merged.hourly[i].pm10 - base.hourly[i].pm10;
    expect(gap(NOW_HOUR + 1)).toBeLessThan(gap(NOW_HOUR + 8));
    expect(gap(NOW_HOUR + 8)).toBeLessThan(gap(NOW_HOUR + 13));
  });

  it('모델 값이 없는 시간대(none)는 건드리지 않는다', () => {
    const base = makeResult(() => 20);
    base.hourly[30] = { ...base.hourly[30], pm10: 0, pm10Source: 'none' };
    const merged = applyDustForecast(base, forecastOf('좋음', '나쁨'));
    expect(merged.hourly[30]).toBe(base.hourly[30]);
  });

  it('오늘 남은 시간대가 너무 적으면 오늘은 보정하지 않는다', () => {
    const base = makeResult(() => 20, 22);
    const merged = applyDustForecast(base, forecastOf('나쁨', '보통'));
    expect(merged.hourly.slice(0, 24)).toEqual(base.hourly.slice(0, 24));
  });

  it('예보 날짜가 오늘·내일 밖이면 무시한다', () => {
    const base = makeResult(() => 20);
    const forecast: AirForecast = { today: '2026-10-31', days: [{ date: '2026-11-02', grade: '나쁨' }] };
    expect(applyDustForecast(base, forecast).hourly).toBe(base.hourly);
  });

  it('PM10은 0 아래로 내려가지 않는다', () => {
    const merged = applyDustForecast(makeResult(() => 5), forecastOf('좋음', '좋음'));
    expect(merged.hourly.every((h) => h.pm10 >= 0)).toBe(true);
  });
});
