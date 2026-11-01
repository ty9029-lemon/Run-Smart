import { describe, expect, it } from 'vitest';
import type { HourlyWeather, Weather } from '../types';
import type { WeatherResult } from './openMeteo';
import { applyRainForecast, type RainForecast } from './rainForecast';

/** 맑은 낮 날씨 */
const CLEAR: Weather = {
  temp: 10,
  humidity: 60,
  windSpeed: 1,
  precipitation: 0,
  condition: '맑음',
  pm10: 20,
  uvIndex: 2,
  isDay: true,
};

/** 오늘·내일 48시간이 모두 맑은 날씨. 지금은 오늘 16시 */
function makeResult(overrides: Partial<HourlyWeather> = {}): WeatherResult {
  const hourly = Array.from({ length: 48 }, (_, i): HourlyWeather => ({
    ...CLEAR,
    hour: i % 24,
    ...overrides,
  }));
  return { current: { ...CLEAR, hour: 16 }, hourly };
}

const TODAY = '2026-11-01';
const forecastOf = (hours: RainForecast['hours']): RainForecast => ({ today: TODAY, hours });

describe('applyRainForecast', () => {
  it('예보가 없으면 원본을 그대로 돌려준다', () => {
    const result = makeResult();
    expect(applyRainForecast(result, null)).toBe(result);
    expect(applyRainForecast(result, forecastOf([]))).toBe(result);
  });

  it('예보가 비면 모델이 맑음이어도 강수량을 바꾸고 날씨를 비로 본다', () => {
    const out = applyRainForecast(
      makeResult(),
      forecastOf([{ date: TODAY, hour: 18, precipitation: 1.94, kind: 'rain' }]),
    );
    expect(out.hourly[18].precipitation).toBe(1.9);
    expect(out.hourly[18].condition).toBe('비');
  });

  it('눈·소나기 예보는 그 날씨로 바꾼다', () => {
    const out = applyRainForecast(
      makeResult(),
      forecastOf([
        { date: TODAY, hour: 18, precipitation: 0.5, kind: 'snow' },
        { date: TODAY, hour: 19, precipitation: 0.5, kind: 'shower' },
      ]),
    );
    expect(out.hourly[18].condition).toBe('눈');
    expect(out.hourly[19].condition).toBe('소나기');
  });

  it('모델이 이미 강수 상태면 날씨를 그대로 두고 강수량만 바꾼다', () => {
    const out = applyRainForecast(
      makeResult({ condition: '이슬비', precipitation: 0.1 }),
      forecastOf([{ date: TODAY, hour: 18, precipitation: 1, kind: 'rain' }]),
    );
    expect(out.hourly[18].condition).toBe('이슬비');
    expect(out.hourly[18].precipitation).toBe(1);
  });

  it('예보가 강수 없음이면 모델의 비 상태와 강수량을 거둔다', () => {
    const out = applyRainForecast(
      makeResult({ condition: '비', precipitation: 0.7 }),
      forecastOf([{ date: TODAY, hour: 20, precipitation: 0, kind: 'none' }]),
    );
    expect(out.hourly[20].precipitation).toBe(0);
    expect(out.hourly[20].condition).toBe('흐림');
  });

  it('예보가 없는 시간대는 모델 값을 유지한다', () => {
    const out = applyRainForecast(
      makeResult({ precipitation: 0.3 }),
      forecastOf([{ date: TODAY, hour: 18, precipitation: 1, kind: 'rain' }]),
    );
    expect(out.hourly[19].precipitation).toBe(0.3);
  });

  it('이미 지난 시간대는 건드리지 않는다', () => {
    const out = applyRainForecast(
      makeResult(),
      forecastOf([{ date: TODAY, hour: 10, precipitation: 2, kind: 'rain' }]),
    );
    expect(out.hourly[10].precipitation).toBe(0);
    expect(out.hourly[10].condition).toBe('맑음');
  });

  it('내일 시간대는 날짜로 맞춰 바꾼다', () => {
    const out = applyRainForecast(
      makeResult(),
      forecastOf([{ date: '2026-11-02', hour: 7, precipitation: 3, kind: 'rain' }]),
    );
    expect(out.hourly[24 + 7].precipitation).toBe(3);
    expect(out.hourly[7].precipitation).toBe(0);
  });

  it('현재 날씨(실측)는 바꾸지 않는다', () => {
    const result = makeResult();
    const out = applyRainForecast(
      result,
      forecastOf([{ date: TODAY, hour: 16, precipitation: 2, kind: 'rain' }]),
    );
    expect(out.current).toBe(result.current);
  });

  it('지금 시각 슬롯은 예보가 0mm여도 실측에 비가 있으면 실측을 따른다', () => {
    const result = makeResult();
    const raining = {
      ...result,
      current: { ...result.current, precipitation: 0.5, condition: '비' },
    };
    const out = applyRainForecast(
      raining,
      forecastOf([{ date: TODAY, hour: 16, precipitation: 0, kind: 'none' }]),
    );
    expect(out.hourly[16].precipitation).toBe(0.5);
    expect(out.hourly[16].condition).toBe('비');
  });

  it('지금 시각 슬롯은 예보가 실측보다 많으면 예보를 따른다', () => {
    const out = applyRainForecast(
      makeResult(),
      forecastOf([{ date: TODAY, hour: 16, precipitation: 2, kind: 'rain' }]),
    );
    expect(out.hourly[16].precipitation).toBe(2);
    expect(out.hourly[16].condition).toBe('비');
  });
});
