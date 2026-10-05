import { DUMMY_CURRENT_WEATHER, DUMMY_HOURLY } from '../data/dummyWeather';
import type { HourlyWeather, Weather } from '../types';

/** 날씨 조회 결과 */
export interface WeatherResult {
  current: Weather;
  hourly: HourlyWeather[];
}

/**
 * 날씨를 조회한다. (M1: 더미 반환 / M2에서 OpenWeatherMap으로 교체)
 */
export async function fetchWeather(): Promise<WeatherResult> {
  return { current: DUMMY_CURRENT_WEATHER, hourly: DUMMY_HOURLY };
}
