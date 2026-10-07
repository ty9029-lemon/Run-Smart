import { HOURS_IN_DAY } from '../constants/thresholds';
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

/**
 * 현재 시각이 속한 시간대부터 24시간(자정을 넘으면 내일까지)을 잘라 돌려준다.
 * @param hourly 오늘부터 이어지는 시간대별 날씨
 * @param nowHour 현재 시(0~23). 목록에 없으면 앞에서부터 24개를 쓴다.
 */
export function sliceFromHour(hourly: HourlyWeather[], nowHour: number): HourlyWeather[] {
  const start = Math.max(hourly.findIndex((h) => h.hour === nowHour), 0);
  return hourly.slice(start, start + HOURS_IN_DAY);
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

/**
 * 오늘 남은 시간대 중에서만 가장 점수가 높은 시간대를 찾는다. (내일 칸은 추천하지 않는다)
 * @param scores 현재 시각부터 시작하는 시간대별 점수
 * @param nowHour 현재 시(0~23). 목록 앞의 (24 - nowHour)개가 오늘이다.
 */
export function findBestHourToday(scores: HourScore[], nowHour: number): HourScore | null {
  return findBestHour(scores.slice(0, HOURS_IN_DAY - nowHour));
}
