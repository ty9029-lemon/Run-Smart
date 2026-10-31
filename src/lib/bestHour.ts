import { ACTIVITY_COMFORT } from '../constants/scoring';
import {
  HOURS_IN_DAY,
  RECOMMEND_CUTOFF_HOUR,
  RECOMMEND_MIN_SCORE,
  RECOMMEND_SCORE_MARGIN,
} from '../constants/thresholds';
import type { Activity, Constraint, HourlyWeather, Sensitivity } from '../types';
import { hasDustData } from './airGrade';
import { calcPersonalFeelsLike } from './feelsLike';
import { calcRunScore } from './runScore';
import { hasDaylightScore } from './scoreFactors';

/** 시간대별 점수. 동점일 때 우열을 가리는 값(미세먼지, 자외선, 쾌적 구간 거리)을 함께 담는다. */
export interface HourScore {
  hour: number;
  score: number;
  /** 미세먼지 PM10 */
  pm10?: number;
  /** 자외선 지수 */
  uvIndex?: number;
  /** 일조 감점을 받지 않는 시간대인지 (해가 떠 있거나 러닝의 저녁 구간). false면 추천 후보에서 제외한다 */
  isDay?: boolean;
  /** 개인 체감온도가 활동의 쾌적(만점) 구간에서 벗어난 정도(°C). 구간 안이면 0 */
  comfortGap?: number;
}

/**
 * 개인 체감온도가 활동의 쾌적(만점) 구간에서 얼마나 벗어났는지 계산한다.
 * @param weather 시간대 날씨
 * @param sensitivity 추위·더위 민감도
 * @param activity 활동
 */
function calcComfortGap(
  weather: HourlyWeather,
  sensitivity: Sensitivity,
  activity: Activity,
): number {
  const { coreMin, coreMax } = ACTIVITY_COMFORT[activity];
  const felt = calcPersonalFeelsLike(weather, sensitivity);
  return Math.max(coreMin - felt, felt - coreMax, 0);
}

/**
 * 시간대별 활동 지수를 계산한다.
 * @param hourly 시간대별 날씨
 * @param sensitivity 추위·더위 민감도
 * @param constraints 제약사항
 * @param activity 활동
 */
export function scoreHours(
  hourly: HourlyWeather[],
  sensitivity: Sensitivity,
  constraints: Constraint[],
  activity: Activity,
): HourScore[] {
  return hourly.map((h) => ({
    hour: h.hour,
    score: calcRunScore(h, sensitivity, constraints, activity),
    // 값이 없는 시간대의 0을 '가장 깨끗함'으로 비교하지 않는다
    pm10: hasDustData(h) ? h.pm10 : undefined,
    uvIndex: h.uvIndex,
    isDay: hasDaylightScore(h, activity),
    comfortGap: calcComfortGap(h, sensitivity, activity),
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
 * 두 시간대를 비교해 cur가 best보다 확실히 나은지 판단한다.
 * 점수 → (동점이면) 미세먼지가 낮은 쪽 → 자외선 지수가 낮은 쪽 → 쾌적 구간에 가까운 쪽 순으로 따진다.
 * 모두 같으면 false라서 먼저 나온(더 이른) 시간이 유지된다.
 * 값이 없는 항목은 비교하지 않는다.
 */
function isBetterHour(cur: HourScore, best: HourScore): boolean {
  if (cur.score !== best.score) return cur.score > best.score;
  if (cur.pm10 !== undefined && best.pm10 !== undefined && cur.pm10 !== best.pm10) {
    return cur.pm10 < best.pm10;
  }
  if (cur.uvIndex !== undefined && best.uvIndex !== undefined && cur.uvIndex !== best.uvIndex) {
    return cur.uvIndex < best.uvIndex;
  }
  if (cur.comfortGap !== undefined && best.comfortGap !== undefined) {
    return cur.comfortGap < best.comfortGap;
  }
  return false;
}

/**
 * 가장 점수가 높은 시간대를 찾는다. 점수가 같으면 미세먼지가 낮은 시간 → 자외선 지수가 낮은 시간 →
 * 체감 쾌적 구간에 가까운 시간 순으로 고르고, 그래도 같으면 더 이른 시간을 고른다.
 * @param scores 시간대별 점수 (비어 있으면 null)
 * @param fromHour 이 시각 이후(포함)만 찾는다. 이미 지난 시간대를 추천하지 않기 위해 현재 시각을 넘긴다.
 */
export function findBestHour(
  scores: HourScore[],
  fromHour: number = DAY_START_HOUR,
): HourScore | null {
  const upcoming = scores.filter((s) => s.hour >= fromHour);
  if (upcoming.length === 0) return null;
  return upcoming.reduce((best, cur) => (isBetterHour(cur, best) ? cur : best));
}

/**
 * 현재 시각부터 시작하는 점수 목록에서 오늘 남은 시간대만 잘라 돌려준다.
 * @param scores 현재 시각부터 시작하는 시간대별 점수
 * @param nowHour 현재 시(0~23). 목록 앞의 (24 - nowHour)개가 오늘이다.
 */
export function sliceToday(scores: HourScore[], nowHour: number): HourScore[] {
  return scores.slice(0, HOURS_IN_DAY - nowHour);
}

/**
 * 현재 시각부터 시작하는 목록의 index번째 칸이 내일인지 알려준다.
 * @param index 목록에서의 위치 (0이 현재 시각)
 * @param nowHour 현재 시(0~23). 목록 앞의 (24 - nowHour)개가 오늘이다.
 */
export function isTomorrowIndex(index: number, nowHour: number): boolean {
  return index >= HOURS_IN_DAY - nowHour;
}

/**
 * 추천 대상 시각인지 확인한다. RECOMMEND_CUTOFF_HOUR 이후와, 해가 진 뒤(isDay가 false)는 제외한다.
 * @param hour 시각(0~23)
 * @param isDay 해가 떠 있는지. 모르면(undefined) 시각만 본다.
 */
export function isRecommendableHour(hour: number, isDay?: boolean): boolean {
  return hour < RECOMMEND_CUTOFF_HOUR && isDay !== false;
}

/**
 * 오늘 남은 시간대 중에서만 가장 점수가 높은 시간대를 찾는다. (내일 칸과 22시 이후는 추천하지 않는다)
 * @param scores 현재 시각부터 시작하는 시간대별 점수
 * @param nowHour 현재 시(0~23). 목록 앞의 (24 - nowHour)개가 오늘이다.
 */
export function findBestHourToday(scores: HourScore[], nowHour: number): HourScore | null {
  return findBestHour(sliceToday(scores, nowHour).filter((s) => isRecommendableHour(s.hour, s.isDay)));
}

/** 함께 추천하는 연속 시간대 구간 (양 끝 시각 포함) */
export interface HourRange {
  startHour: number;
  endHour: number;
}

/**
 * 대표 시간대를 포함하면서 함께 좋은(최고점과 3점 이내, 80점 이상) 연속 구간을 찾는다.
 * 대표 시간대 하나뿐이거나 최고점이 80점 미만이면 null이다.
 * @param todayScores 오늘 남은 시간대별 점수 (연속된 시각 순)
 * @param best 대표 시간대
 */
export function findGoodRange(todayScores: HourScore[], best: HourScore | null): HourRange | null {
  if (!best || best.score < RECOMMEND_MIN_SCORE) return null;
  const minScore = Math.max(best.score - RECOMMEND_SCORE_MARGIN, RECOMMEND_MIN_SCORE);
  const bestIndex = todayScores.findIndex((s) => s.hour === best.hour);
  const isGood = (i: number) =>
    todayScores[i]?.score >= minScore && isRecommendableHour(todayScores[i].hour, todayScores[i].isDay);
  let start = bestIndex;
  let end = bestIndex;
  while (isGood(start - 1)) start -= 1;
  while (isGood(end + 1)) end += 1;
  if (start === end) return null;
  return { startHour: todayScores[start].hour, endHour: todayScores[end].hour };
}
