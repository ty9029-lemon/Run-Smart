import {
  HUMIDITY_BASE,
  HUMIDITY_CHILL_PER_10,
  HUMIDITY_UNIT,
  WIND_CHILL_PER_MS,
} from '../constants/thresholds';
import type { Weather } from '../types';

/**
 * 객관적 체감온도(바람·습도 반영)를 계산한다.
 * @param weather 날씨 정보
 */
export function calcFeelsLike(weather: Weather): number {
  const windChill = weather.windSpeed * WIND_CHILL_PER_MS;
  const humidityExcess = Math.max(0, weather.humidity - HUMIDITY_BASE);
  const humidityChill = (humidityExcess / HUMIDITY_UNIT) * HUMIDITY_CHILL_PER_10;
  return weather.temp - windChill - humidityChill;
}

/**
 * 사용자 보정값까지 반영한 개인 체감온도를 계산한다.
 * 보정값이 음수면 추위를 많이 타는 사람이라 더 춥게 느낀다.
 * @param weather 날씨 정보
 * @param offset 체감 온도 보정값(-5 ~ +5)
 */
export function calcPersonalFeelsLike(weather: Weather, offset: number): number {
  return Math.round(calcFeelsLike(weather) + offset);
}
