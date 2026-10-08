import {
  HUMIDITY_BASE,
  HUMIDITY_CHILL_PER_10,
  HUMIDITY_UNIT,
  SENSITIVITY_DEFAULT,
  SENSITIVITY_DEGREE_PER_LEVEL,
  SENSITIVITY_RAMP,
  SENSITIVITY_REFERENCE_TEMP,
  WIND_CHILL_PER_MS,
} from '../constants/thresholds';
import type { Sensitivity, Weather } from '../types';

/** 추위·더위 모두 '보통'인 민감도 (보정 없음) */
export const NEUTRAL_SENSITIVITY: Sensitivity = {
  coldLevel: SENSITIVITY_DEFAULT,
  heatLevel: SENSITIVITY_DEFAULT,
};

/** 0~1 범위로 자른다. */
function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value));
}

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
 * 추위·더위 민감도에 따른 체감온도 보정(°C)을 계산한다.
 * 기준 온도보다 쌀쌀할수록 추위 민감도가, 더울수록 더위 민감도가 더 크게 반영된다.
 * 추위를 많이 타면 더 춥게(음수), 더위를 많이 타면 더 덥게(양수) 느낀다.
 * @param feelsLike 객관적 체감온도
 * @param sensitivity 추위·더위 민감도
 */
export function calcSensitivityAdjust(feelsLike: number, sensitivity: Sensitivity): number {
  const coldWeight = clampUnit((SENSITIVITY_REFERENCE_TEMP - feelsLike) / SENSITIVITY_RAMP);
  const heatWeight = clampUnit((feelsLike - SENSITIVITY_REFERENCE_TEMP) / SENSITIVITY_RAMP);
  const cold = (sensitivity.coldLevel - SENSITIVITY_DEFAULT) * coldWeight;
  const heat = (sensitivity.heatLevel - SENSITIVITY_DEFAULT) * heatWeight;
  return (heat - cold) * SENSITIVITY_DEGREE_PER_LEVEL;
}

/**
 * 추위·더위 민감도와 피드백 보정까지 반영한 개인 체감온도를 계산한다.
 * @param weather 날씨 정보
 * @param sensitivity 추위·더위 민감도 (피드백 보정 포함)
 */
export function calcPersonalFeelsLike(weather: Weather, sensitivity: Sensitivity): number {
  const feelsLike = calcFeelsLike(weather);
  const adjust = calcSensitivityAdjust(feelsLike, sensitivity);
  return Math.round(feelsLike + adjust + (sensitivity.feedbackOffset ?? 0));
}

/**
 * 객관적 체감온도 대비 개인 체감온도의 차이(°C)를 구한다. (AI 요청용 보정값)
 * @param weather 날씨 정보
 * @param sensitivity 추위·더위 민감도
 */
export function calcAppliedOffset(weather: Weather, sensitivity: Sensitivity): number {
  return calcPersonalFeelsLike(weather, sensitivity) - Math.round(calcFeelsLike(weather));
}
