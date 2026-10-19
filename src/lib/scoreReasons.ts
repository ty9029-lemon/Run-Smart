import {
  MAX_REASON_ITEMS,
  MIN_REASON_PENALTY,
  REASON_GOOD_RATIO,
  REASON_NORMAL_RATIO,
  SCORE_FACTOR_LABEL,
  SCORE_REASON_MESSAGES,
} from '../constants/scoreReasons';
import { ACTIVITY_SCORE_WEIGHTS } from '../constants/scoring';
import type { Activity, Constraint, Weather } from '../types';
import type { ScoreBreakdown } from './runScore';
import { isColdAir, isDryAir } from './scoreFactors';

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
      const max = weights[key];
      const rawPenalty = Math.max(0, max - breakdown[key]);
      return {
        key,
        label: SCORE_FACTOR_LABEL[key],
        points: Math.round(breakdown[key]),
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
 * 깎인 비율을 한 줄 해석으로 바꾼다.
 * @param ratio 깎인 비율 (0~1)
 */
export function describeRatio(ratio: number): string {
  if (ratio < REASON_GOOD_RATIO) return SCORE_REASON_MESSAGES.good;
  if (ratio < REASON_NORMAL_RATIO) return SCORE_REASON_MESSAGES.normal;
  return SCORE_REASON_MESSAGES.bad;
}

/**
 * 항목의 현재 값을 단위와 함께 문자열로 만든다.
 * @param key 항목
 * @param weather 날씨
 * @param feelsLike 개인 체감온도
 */
export function formatFactorValue(
  key: keyof ScoreBreakdown,
  weather: Weather,
  feelsLike: number,
): string {
  const values: Record<keyof ScoreBreakdown, string> = {
    feelsLike: `${feelsLike}°C`,
    temp: `${weather.temp}°C`,
    precipitation: `${weather.precipitation}mm`,
    wind: `${weather.windSpeed}m/s`,
    humidity: `${weather.humidity}%`,
    dust: `${weather.pm10}㎍/㎥`,
    daylight: weather.isDay ? SCORE_REASON_MESSAGES.day : SCORE_REASON_MESSAGES.night,
    uv: `UV ${weather.uvIndex}`,
  };
  return values[key];
}
