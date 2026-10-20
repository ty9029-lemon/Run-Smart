import {
  ACTIVITY_COMFORT,
  ACTIVITY_DAYLIGHT_BUFFER_HOURS,
  ACTIVITY_NIGHT_EXTRA_PENALTY,
  ACTIVITY_SCORE_WEIGHTS,
  type SCORE_WEIGHTS,
} from '../constants/scoring';
import {
  RECOMMEND_MIN_SCORE,
  SCORE_CAUTION,
  SCORE_FAIR,
  SCORE_GOOD,
  SCORE_MAX,
  SCORE_MIN,
} from '../constants/thresholds';
import { LEVEL_LABEL, NIGHT_HEADLINE, RUNNING_TIER_LABEL } from '../constants/messages';
import type {
  Activity,
  Constraint,
  ScoreTier,
  Sensitivity,
  Weather,
  WarningLevel,
} from '../types';
import { calcPersonalFeelsLike } from './feelsLike';
import {
  applySensitivity,
  daylightQuality,
  dustQuality,
  feelsLikeQuality,
  humidityQuality,
  isColdAir,
  isDryAir,
  rainQuality,
  tempQuality,
  uvQuality,
  windQuality,
} from './scoreFactors';

/**
 * 항목별 점수. 합이 총점이다. 각 값은 0 ~ 해당 항목 배점이다.
 * 다만 러닝·산책의 일조 항목은 밤에 추가 감점이 들어가 음수일 수 있다. (ACTIVITY_NIGHT_EXTRA_PENALTY)
 */
export type ScoreBreakdown = { [K in keyof typeof SCORE_WEIGHTS]: number };

/**
 * 항목별 점수를 계산한다. (배점 × 품질)
 * @param weather 날씨 정보
 * @param sensitivity 추위·더위 민감도
 * @param constraints 제약사항
 * @param activity 활동 (체감온도 적정 구간과 배점표가 다르다)
 */
export function calcScoreBreakdown(
  weather: Weather,
  sensitivity: Sensitivity,
  constraints: Constraint[],
  activity: Activity,
): ScoreBreakdown {
  const felt = calcPersonalFeelsLike(weather, sensitivity);
  const rhinitis = constraints.includes('rhinitis');
  const dustSensitive =
    constraints.includes('dustSensitive') || constraints.includes('asthma') || rhinitis;
  const w = ACTIVITY_SCORE_WEIGHTS[activity];
  const daylightQ = daylightQuality(
    weather.isDay,
    weather.hoursUntilSunset,
    ACTIVITY_DAYLIGHT_BUFFER_HOURS[activity],
  );
  return {
    feelsLike: w.feelsLike * feelsLikeQuality(felt, ACTIVITY_COMFORT[activity]),
    // 비염은 찬 공기에서만 기온 감점을 키운다
    temp: w.temp * applySensitivity(tempQuality(weather.temp), rhinitis && isColdAir(weather.temp)),
    precipitation: w.precipitation * rainQuality(weather.precipitation),
    wind: w.wind * windQuality(weather.windSpeed),
    // 비염은 건조한 공기에서만 습도 감점을 키운다 (습한 쪽은 제외)
    humidity:
      w.humidity *
      applySensitivity(humidityQuality(weather.humidity), rhinitis && isDryAir(weather.humidity)),
    dust: w.dust * applySensitivity(dustQuality(weather.pm10), dustSensitive),
    daylight:
      w.daylight * daylightQ - ACTIVITY_NIGHT_EXTRA_PENALTY[activity] * (1 - daylightQ),
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

/**
 * 러닝 점수를 5단계로 나눈다. 러닝이 아닌 활동은 단계를 나누지 않는다.
 * 각 단계는 경고 단계(scoreToLevel)를 쪼갠 것이라 서로 어긋나지 않는다.
 * @param score 활동 지수
 * @param activity 활동
 */
export function scoreToTier(score: number, activity: Activity): ScoreTier | null {
  if (activity !== 'running') return null;
  if (score >= RECOMMEND_MIN_SCORE) return 'excellent';
  if (score >= SCORE_GOOD) return 'good';
  if (score >= SCORE_FAIR) return 'fair';
  if (score >= SCORE_CAUTION) return 'caution';
  return 'careful';
}

/**
 * 점수 링 위에 보여줄 헤드라인을 고른다. 러닝은 5단계, 그 밖의 활동은 기존 3단계 문구를 쓴다.
 * 해가 진 뒤(isDay가 false)에는 점수 단계와 상관없이 야간 전용 문구를 보여준다.
 * @param score 활동 지수
 * @param activity 활동
 * @param isDay 해가 떠 있는지. 모르면 낮으로 본다.
 */
export function scoreToHeadline(score: number, activity: Activity, isDay: boolean = true): string {
  if (!isDay) return NIGHT_HEADLINE;
  const tier = scoreToTier(score, activity);
  return tier ? RUNNING_TIER_LABEL[tier] : LEVEL_LABEL[scoreToLevel(score)];
}
