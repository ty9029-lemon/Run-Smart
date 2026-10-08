import { ACTIVITY_COMFORT, SCORE_WEIGHTS } from '../constants/scoring';
import {
  SCORE_CAUTION,
  SCORE_GOOD,
  SCORE_MAX,
  SCORE_MIN,
} from '../constants/thresholds';
import type { Activity, Constraint, Sensitivity, Weather, WarningLevel } from '../types';
import { calcPersonalFeelsLike } from './feelsLike';
import {
  applySensitivity,
  daylightQuality,
  dustQuality,
  feelsLikeQuality,
  humidityQuality,
  rainQuality,
  tempQuality,
  uvQuality,
  windQuality,
} from './scoreFactors';

/** 항목별 점수. 각 값은 0 ~ 해당 항목 배점이고 합이 총점이다. */
export type ScoreBreakdown = { [K in keyof typeof SCORE_WEIGHTS]: number };

/**
 * 항목별 점수를 계산한다. (배점 × 품질)
 * @param weather 날씨 정보
 * @param sensitivity 추위·더위 민감도
 * @param constraints 제약사항
 * @param activity 활동 (체감온도 적정 구간이 다르다)
 */
export function calcScoreBreakdown(
  weather: Weather,
  sensitivity: Sensitivity,
  constraints: Constraint[],
  activity: Activity,
): ScoreBreakdown {
  const felt = calcPersonalFeelsLike(weather, sensitivity);
  const dustSensitive =
    constraints.includes('dustSensitive') || constraints.includes('asthma');
  const w = SCORE_WEIGHTS;
  return {
    feelsLike: w.feelsLike * feelsLikeQuality(felt, ACTIVITY_COMFORT[activity]),
    temp: w.temp * tempQuality(weather.temp),
    precipitation: w.precipitation * rainQuality(weather.precipitation),
    wind: w.wind * windQuality(weather.windSpeed),
    humidity: w.humidity * humidityQuality(weather.humidity),
    dust: w.dust * applySensitivity(dustQuality(weather.pm10), dustSensitive),
    daylight: w.daylight * daylightQuality(weather.isDay),
    uv: w.uv * applySensitivity(uvQuality(weather.uvIndex), constraints.includes('uvSensitive')),
  };
}

/**
 * 활동 지수(0~100)를 계산한다.
 * @param weather 날씨 정보
 * @param sensitivity 추위·더위 민감도
 * @param constraints 제약사항
 * @param activity 활동
 */
export function calcRunScore(
  weather: Weather,
  sensitivity: Sensitivity,
  constraints: Constraint[],
  activity: Activity,
): number {
  const breakdown = calcScoreBreakdown(weather, sensitivity, constraints, activity);
  const total = Object.values(breakdown).reduce((sum, points) => sum + points, 0);
  return Math.round(Math.min(SCORE_MAX, Math.max(SCORE_MIN, total)));
}

/** 점수를 경고 단계로 변환 */
export function scoreToLevel(score: number): WarningLevel {
  if (score >= SCORE_GOOD) return 'good';
  if (score >= SCORE_CAUTION) return 'caution';
  return 'careful';
}
