import type { Activity, Constraint, HourlyWeather } from '../types';
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
 * @param activity 활동
 */
export function scoreHours(
  hourly: HourlyWeather[],
  offset: number,
  constraints: Constraint[],
  activity: Activity,
): HourScore[] {
  return hourly.map((h) => ({
    hour: h.hour,
    score: calcRunScore(h, offset, constraints, activity),
  }));
}

/** 하루의 첫 시각(0시). 시작 시각을 따로 주지 않으면 하루 전체에서 찾는다. */
const DAY_START_HOUR = 0;

/**
 * 가장 점수가 높은 시간대를 찾는다. 점수가 같으면 더 이른 시간을 고른다.
 * @param scores 시간대별 점수 (비어 있으면 null)
 * @param fromHour 이 시각 이후(포함)만 찾는다. 이미 지난 시간대를 추천하지 않기 위해 현재 시각을 넘긴다.
 */
export function findBestHour(
  scores: HourScore[],
  fromHour: number = DAY_START_HOUR,
): HourScore | null {
  const upcoming = scores.filter((s) => s.hour >= fromHour);
  if (upcoming.length === 0) return null;
  return upcoming.reduce((best, cur) => (cur.score > best.score ? cur : best));
}
