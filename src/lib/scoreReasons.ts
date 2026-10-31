import {
  MAX_REASON_ITEMS,
  MIN_REASON_PENALTY,
  REASON_GOOD_RATIO,
  REASON_NORMAL_RATIO,
  SCORE_FACTOR_LABEL,
  SCORE_REASON_MESSAGES,
  SUNSET_HOURS_ROUND_UNIT,
} from '../constants/scoreReasons';
import { ACTIVITY_DAYLIGHT_BUFFER_HOURS, ACTIVITY_SCORE_WEIGHTS } from '../constants/scoring';
import type { Activity, Constraint, WarningLevel, Weather } from '../types';
import { DUST_UNAVAILABLE_LABEL, hasDustData } from './airGrade';
import type { ScoreBreakdown } from './runScore';
import { isColdAir, isDryAir } from './scoreFactors';

/** 단계별 해석 문구 */
const RATIO_MESSAGES: Record<WarningLevel, string> = {
  good: SCORE_REASON_MESSAGES.good,
  caution: SCORE_REASON_MESSAGES.normal,
  careful: SCORE_REASON_MESSAGES.bad,
};

/** 점수 항목 하나의 근거 */
export interface ScoreReason {
  key: keyof ScoreBreakdown;
  label: string;
  /** 받은 점수 (반올림) */
  points: number;
  /** 항목 배점 */
  max: number;
  /** 깎인 점수 (반올림, 0 이상) */
  penalty: number;
  /** 깎인 비율 (0~1, 반올림 전 값 기준) */
  ratio: number;
  /** 내 설정(질환) 때문에 더 엄격하게 본 항목인지 */
  sensitive: boolean;
}

/**
 * 내 설정 때문에 감점을 키운 항목인지 판단한다. (calcScoreBreakdown의 규칙과 같아야 한다)
 * @param key 항목
 * @param constraints 제약사항
 * @param weather 날씨 (비염의 찬·건조 공기 판단에 쓴다)
 */
function isSensitiveFactor(
  key: keyof ScoreBreakdown,
  constraints: Constraint[],
  weather: Weather,
): boolean {
  const rhinitis = constraints.includes('rhinitis');
  if (key === 'dust') {
    return rhinitis || constraints.includes('dustSensitive') || constraints.includes('asthma');
  }
  if (key === 'uv') return constraints.includes('uvSensitive');
  if (key === 'temp') return rhinitis && isColdAir(weather.temp);
  if (key === 'humidity') return rhinitis && isDryAir(weather.humidity);
  return false;
}

/**
 * 항목별 점수를 감점이 큰 순서로 정리한다.
 * @param breakdown 항목별 점수
 * @param activity 활동 (배점표가 다르다)
 * @param constraints 제약사항
 * @param weather 날씨
 */
export function buildScoreReasons(
  breakdown: ScoreBreakdown,
  activity: Activity,
  constraints: Constraint[],
  weather: Weather,
): ScoreReason[] {
  const weights = ACTIVITY_SCORE_WEIGHTS[activity];
  const keys = Object.keys(breakdown) as (keyof ScoreBreakdown)[];
  return keys
    .map((key) => {
      // 러닝·산책의 일조 항목은 밤에 음수(추가 감점)가 된다. 그만큼을 만점에 더해 "일조 시간 −35점"으로 보여 준다.
      const nightExtra = key === 'daylight' ? Math.max(0, -breakdown[key]) : 0;
      const max = weights[key] + nightExtra;
      const earned = Math.max(0, breakdown[key]);
      const rawPenalty = Math.max(0, max - earned);
      return {
        key,
        label: SCORE_FACTOR_LABEL[key],
        points: Math.round(earned),
        max,
        penalty: Math.round(rawPenalty),
        ratio: max > 0 ? rawPenalty / max : 0,
        sensitive: isSensitiveFactor(key, constraints, weather),
      };
    })
    .sort((a, b) => b.ratio * b.max - a.ratio * a.max);
}

/**
 * 점수 카드 아래에 보여줄 "깎인 이유"만 고른다. (감점이 기준 이상인 항목, 큰 순서)
 * @param reasons buildScoreReasons 결과
 */
export function pickTopReasons(reasons: ScoreReason[]): ScoreReason[] {
  return reasons.filter((r) => r.penalty >= MIN_REASON_PENALTY).slice(0, MAX_REASON_ITEMS);
}

/**
 * 깎인 비율을 좋음·보통·나쁨 단계로 나눈다.
 * @param ratio 깎인 비율 (0~1)
 */
export function ratioToLevel(ratio: number): WarningLevel {
  if (ratio < REASON_GOOD_RATIO) return 'good';
  if (ratio < REASON_NORMAL_RATIO) return 'caution';
  return 'careful';
}

/**
 * 깎인 비율을 한 줄 해석으로 바꾼다.
 * @param ratio 깎인 비율 (0~1)
 */
export function describeRatio(ratio: number): string {
  return RATIO_MESSAGES[ratioToLevel(ratio)];
}

/**
 * 일조 시간 항목의 값을 만든다. 등산·자전거처럼 일몰 전 여유를 따지는 활동은 일몰까지 남은 시간을 쓴다.
 * @param weather 날씨
 * @param activity 활동
 */
function formatDaylightValue(weather: Weather, activity: Activity): string {
  const { isDay, hoursUntilSunset } = weather;
  if (!isDay) return SCORE_REASON_MESSAGES.night;
  if (ACTIVITY_DAYLIGHT_BUFFER_HOURS[activity] > 0 && hoursUntilSunset !== undefined) {
    const hours = Math.round(hoursUntilSunset * SUNSET_HOURS_ROUND_UNIT) / SUNSET_HOURS_ROUND_UNIT;
    return `일몰까지 ${hours}시간`;
  }
  return SCORE_REASON_MESSAGES.day;
}

/**
 * 항목의 현재 값을 단위와 함께 문자열로 만든다.
 * @param key 항목
 * @param weather 날씨
 * @param feelsLike 개인 체감온도
 * @param activity 활동 (일몰 전 여유 시간을 따지는 활동만 일몰까지 남은 시간을 보여준다)
 */
export function formatFactorValue(
  key: keyof ScoreBreakdown,
  weather: Weather,
  feelsLike: number,
  activity: Activity,
): string {
  const values: Record<keyof ScoreBreakdown, string> = {
    feelsLike: `${feelsLike}°C`,
    temp: `${weather.temp}°C`,
    precipitation: `${weather.precipitation}mm`,
    wind: `${weather.windSpeed}m/s`,
    humidity: `${weather.humidity}%`,
    dust: hasDustData(weather) ? `${weather.pm10}㎍/㎥` : DUST_UNAVAILABLE_LABEL,
    daylight: formatDaylightValue(weather, activity),
    uv: `UV ${weather.uvIndex}`,
  };
  return values[key];
}

/** 선택한 시각이 지금과 비교해 항목 점수가 달라진 정도 */
export interface ScoreDelta {
  key: keyof ScoreBreakdown;
  label: string;
  /** 지금 대비 점수 차이 (반올림, 양수면 지금보다 높다) */
  diff: number;
}

/**
 * 선택한 시각의 항목 점수를 지금과 비교해, 차이가 큰 항목을 큰 순서로 고른다.
 * 차이가 기준(MIN_REASON_PENALTY) 미만인 항목은 뺀다.
 * @param selected 선택한 시각의 항목별 점수
 * @param base 지금의 항목별 점수
 */
export function buildScoreDeltas(selected: ScoreBreakdown, base: ScoreBreakdown): ScoreDelta[] {
  const keys = Object.keys(selected) as (keyof ScoreBreakdown)[];
  return keys
    .map((key) => ({
      key,
      label: SCORE_FACTOR_LABEL[key],
      diff: Math.round(selected[key] - base[key]),
    }))
    .filter((d) => Math.abs(d.diff) >= MIN_REASON_PENALTY)
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
    .slice(0, MAX_REASON_ITEMS);
}
