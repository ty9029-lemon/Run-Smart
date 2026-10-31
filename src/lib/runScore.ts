import {
  ACTIVITY_COMFORT,
  ACTIVITY_DAYLIGHT_BUFFER_HOURS,
  ACTIVITY_NIGHT_EXTRA_PENALTY,
  ACTIVITY_SCORE_WEIGHTS,
  DUST_UNKNOWN_PM10,
  type SCORE_WEIGHTS,
} from '../constants/scoring';
import {
  DUST_BAD_SCORE_CAP,
  DUST_BAD_SENSITIVE_SCORE_CAP,
  DUST_NORMAL_SENSITIVE_SCORE_CAP,
  DUST_VERY_BAD_SCORE_CAP,
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
import { getOverallDustGrade, hasDustData } from './airGrade';
import { calcPersonalFeelsLike } from './feelsLike';
import {
  applySensitivity,
  daylightQuality,
  dustQuality,
  feelsLikeQuality,
  humidityQuality,
  isColdAir,
  isDryAir,
  isEveningDaylightExempt,
  pm25Quality,
  rainQuality,
  tempQuality,
  uvQuality,
  windQuality,
} from './scoreFactors';

/**
 * 항목별 점수. 합이 총점이다. 각 값은 0 ~ 해당 항목 배점이다.
 * 다만 러닝·산책의 일조 항목은 밤에 추가 감점이 들어가 음수일 수 있다. (ACTIVITY_NIGHT_EXTRA_PENALTY)
 * 러닝은 해 진 뒤에도 21시까지는 일조 감점이 없다. (ACTIVITY_EVENING_DAYLIGHT_EXEMPT)
 */
export type ScoreBreakdown = { [K in keyof typeof SCORE_WEIGHTS]: number };

/** 점수에 쓸 PM10을 고른다. 값이 없으면 만점이 되지 않도록 보수적인 값을 쓴다. */
function dustPm10For(weather: Weather): number {
  return hasDustData(weather) ? weather.pm10 : DUST_UNKNOWN_PM10;
}

/** 항목별 점수의 합 */
function sumBreakdown(breakdown: ScoreBreakdown): number {
  return Object.values(breakdown).reduce((sum, points) => sum + points, 0);
}

/** 미세먼지에 민감한 제약(미세먼지 민감·천식·비염)이 있는지 */
export function isDustSensitive(constraints: Constraint[]): boolean {
  return (
    constraints.includes('dustSensitive') ||
    constraints.includes('asthma') ||
    constraints.includes('rhinitis')
  );
}

/**
 * 미세먼지 항목의 점수(상한을 걸기 전)를 구한다.
 * @param weather 날씨 정보
 * @param constraints 제약사항
 * @param activity 활동 (배점표가 다르다)
 */
export function calcDustPoints(
  weather: Weather,
  constraints: Constraint[],
  activity: Activity,
): number {
  // 초미세먼지 값이 있으면 미세먼지와 초미세먼지 중 나쁜 쪽 품질을 쓴다
  const quality10 = dustQuality(dustPm10For(weather));
  const quality =
    hasDustData(weather) && weather.pm25 !== undefined
      ? Math.min(quality10, pm25Quality(weather.pm25))
      : quality10;
  return ACTIVITY_SCORE_WEIGHTS[activity].dust * applySensitivity(quality, isDustSensitive(constraints));
}

/**
 * 미세먼지 등급에 따른 총점 상한을 구한다. 상한이 없으면 null.
 * 매우나쁨은 모두, 나쁨은 모두(민감군은 더 낮게), 보통은 민감군만 둔다. 값이 없으면 두지 않는다.
 */
function dustScoreCap(weather: Weather, dustSensitive: boolean): number | null {
  if (!hasDustData(weather)) return null;
  const grade = getOverallDustGrade(weather.pm10, weather.pm25);
  if (grade === '매우나쁨') return DUST_VERY_BAD_SCORE_CAP;
  if (grade === '나쁨') return dustSensitive ? DUST_BAD_SENSITIVE_SCORE_CAP : DUST_BAD_SCORE_CAP;
  if (grade === '보통' && dustSensitive) return DUST_NORMAL_SENSITIVE_SCORE_CAP;
  return null;
}

/**
 * 총점이 미세먼지 상한을 넘지 않도록 미세먼지 항목에서 초과분을 더 뺀다.
 * 배점이 작은 미세먼지 감점만으로는 다른 항목이 좋을 때 '딱 좋아요'가 나오기 때문이다.
 * 항목 합이 곧 총점이라 시간대 비교와 감점 합계도 어긋나지 않는다.
 * @param breakdown 항목별 점수
 * @param weather 날씨
 * @param dustSensitive 미세먼지에 민감한 제약이 있는지
 */
function capForDust(
  breakdown: ScoreBreakdown,
  weather: Weather,
  dustSensitive: boolean,
): ScoreBreakdown {
  const cap = dustScoreCap(weather, dustSensitive);
  if (cap === null) return breakdown;
  const excess = sumBreakdown(breakdown) - cap;
  return excess > 0 ? { ...breakdown, dust: breakdown.dust - excess } : breakdown;
}

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
  const dustSensitive = isDustSensitive(constraints);
  const w = ACTIVITY_SCORE_WEIGHTS[activity];
  const daylightQ = isEveningDaylightExempt(weather, activity)
    ? 1
    : daylightQuality(weather.isDay, weather.hoursUntilSunset, ACTIVITY_DAYLIGHT_BUFFER_HOURS[activity]);
  const breakdown: ScoreBreakdown = {
    feelsLike: w.feelsLike * feelsLikeQuality(felt, ACTIVITY_COMFORT[activity]),
    // 비염은 찬 공기에서만 기온 감점을 키운다
    temp: w.temp * applySensitivity(tempQuality(weather.temp), rhinitis && isColdAir(weather.temp)),
    precipitation: w.precipitation * rainQuality(weather.precipitation),
    wind: w.wind * windQuality(weather.windSpeed),
    // 비염은 건조한 공기에서만 습도 감점을 키운다 (습한 쪽은 제외)
    humidity:
      w.humidity *
      applySensitivity(humidityQuality(weather.humidity), rhinitis && isDryAir(weather.humidity)),
    dust: calcDustPoints(weather, constraints, activity),
    daylight:
      w.daylight * daylightQ - ACTIVITY_NIGHT_EXTRA_PENALTY[activity] * (1 - daylightQ),
    uv: w.uv * applySensitivity(uvQuality(weather.uvIndex), constraints.includes('uvSensitive')),
  };
  return capForDust(breakdown, weather, dustSensitive);
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
  const total = sumBreakdown(breakdown);
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
