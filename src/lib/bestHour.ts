import type { Constraint, HourlyWeather } from '../types';
import { calcRunScore } from './runScore';

/** 시간대별 점수 */
export interface HourScore {
  hour: number;
  score: number;
}

/**
 * 시간대별 활동 지수를 계산한다.
 * @param hourly 시간대별 날씨
 * @param offset 체감 온도 보정값
 * @param constraints 제약사항
 */
export function scoreHours(
  hourly: HourlyWeather[],
  offset: number,
  constraints: Constraint[],
): HourScore[] {
  return hourly.map((h) => ({
    hour: h.hour,
    score: calcRunScore(h, offset, constraints),
  }));
}

/**
 * 가장 점수가 높은 시간대를 찾는다.
 * @param scores 시간대별 점수 (비어 있으면 null)
 */
export function findBestHour(scores: HourScore[]): HourScore | null {
  if (scores.length === 0) return null;
  return scores.reduce((best, cur) => (cur.score > best.score ? cur : best));
}
