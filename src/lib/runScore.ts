import {
  COMFORT_TEMP_MAX,
  COMFORT_TEMP_MIN,
  PM10_PENALTY_PER_10,
  PM10_PENALTY_START,
  PM10_UNIT,
  RAIN_PENALTY_PER_MM,
  SCORE_CAUTION,
  SCORE_GOOD,
  SCORE_MAX,
  SCORE_MIN,
  SENSITIVE_PENALTY_MULTIPLIER,
  TEMP_PENALTY_PER_DEGREE,
  UV_PENALTY_PER_LEVEL,
  UV_PENALTY_START,
  WIND_PENALTY_PER_MS,
  WIND_PENALTY_START,
} from '../constants/thresholds';
import type { Constraint, Weather, WarningLevel } from '../types';
import { calcPersonalFeelsLike } from './feelsLike';

/** 쾌적 범위를 벗어난 정도에 따른 감점 */
function tempPenalty(feelsLike: number): number {
  if (feelsLike < COMFORT_TEMP_MIN) {
    return (COMFORT_TEMP_MIN - feelsLike) * TEMP_PENALTY_PER_DEGREE;
  }
  if (feelsLike > COMFORT_TEMP_MAX) {
    return (feelsLike - COMFORT_TEMP_MAX) * TEMP_PENALTY_PER_DEGREE;
  }
  return 0;
}

/** 미세먼지 감점 (민감 제약이 있으면 가중) */
function dustPenalty(pm10: number, constraints: Constraint[]): number {
  const excess = Math.max(0, pm10 - PM10_PENALTY_START);
  const base = (excess / PM10_UNIT) * PM10_PENALTY_PER_10;
  const sensitive =
    constraints.includes('dustSensitive') || constraints.includes('asthma');
  return sensitive ? base * SENSITIVE_PENALTY_MULTIPLIER : base;
}

/** 자외선 감점 (민감 제약이 있으면 가중) */
function uvPenalty(uvIndex: number, constraints: Constraint[]): number {
  const base = Math.max(0, uvIndex - UV_PENALTY_START) * UV_PENALTY_PER_LEVEL;
  return constraints.includes('uvSensitive')
    ? base * SENSITIVE_PENALTY_MULTIPLIER
    : base;
}

/**
 * 활동 지수(0~100)를 계산한다.
 * @param weather 날씨 정보
 * @param offset 체감 온도 보정값
 * @param constraints 제약사항
 */
export function calcRunScore(
  weather: Weather,
  offset: number,
  constraints: Constraint[],
): number {
  const feelsLike = calcPersonalFeelsLike(weather, offset);
  const windPenalty =
    Math.max(0, weather.windSpeed - WIND_PENALTY_START) * WIND_PENALTY_PER_MS;
  const total =
    tempPenalty(feelsLike) +
    windPenalty +
    weather.precipitation * RAIN_PENALTY_PER_MM +
    dustPenalty(weather.pm10, constraints) +
    uvPenalty(weather.uvIndex, constraints);
  return Math.round(Math.min(SCORE_MAX, Math.max(SCORE_MIN, SCORE_MAX - total)));
}

/** 점수를 경고 단계로 변환 */
export function scoreToLevel(score: number): WarningLevel {
  if (score >= SCORE_GOOD) return 'good';
  if (score >= SCORE_CAUTION) return 'caution';
  return 'careful';
}
