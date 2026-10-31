import { OUTFIT_UV_HIGH_MIN, PM10_BAD_MAX, PM10_GOOD, PM10_NORMAL, UV_LOW_MAX } from '../constants/thresholds';
import type { Constraint, DustGrade, UvGrade, UvLevel, Weather } from '../types';

/** 미세먼지 값을 구하지 못했을 때 화면에 보이는 문구 */
export const DUST_UNAVAILABLE_LABEL = '확인 불가';

/**
 * 미세먼지 값이 있는지 확인한다. 없으면 pm10의 0은 실제 농도가 아니다.
 * @param weather 날씨
 */
export function hasDustData(weather: Pick<Weather, 'pm10Source'>): boolean {
  return weather.pm10Source !== 'none';
}

/**
 * 화면에 보일 미세먼지 문구를 만든다. 값이 없으면 "확인 불가".
 * @param weather 날씨
 */
export function formatDust(weather: Pick<Weather, 'pm10' | 'pm10Source'>): string {
  if (!hasDustData(weather)) return DUST_UNAVAILABLE_LABEL;
  return `${getDustGrade(weather.pm10)} (${weather.pm10})`;
}

/**
 * 미세먼지(PM10) 농도를 등급으로 바꾼다. (30 이하 좋음, 80 이하 보통, 150 이하 나쁨, 그 위는 매우나쁨) 날씨 카드·복장·AI 가이드가 같은 기준을 쓴다.
 * @param pm10 PM10 농도(㎍/㎥)
 */
export function getDustGrade(pm10: number): DustGrade {
  if (pm10 <= PM10_GOOD) return '좋음';
  if (pm10 <= PM10_NORMAL) return '보통';
  if (pm10 <= PM10_BAD_MAX) return '나쁨';
  return '매우나쁨';
}

/**
 * 나쁨 이상(나쁨·매우나쁨)인지 확인한다.
 * @param grade 미세먼지 등급
 */
export function isBadDustGrade(grade: DustGrade): boolean {
  return grade === '나쁨' || grade === '매우나쁨';
}

/**
 * 자외선 지수를 등급으로 바꾼다. 복장의 선글라스·선크림 기준과 같다.
 * @param uvIndex 자외선 지수
 */
export function getUvGrade(uvIndex: number): UvGrade {
  return uvIndex >= OUTFIT_UV_HIGH_MIN ? '높음' : '보통';
}

/**
 * 자외선 지수를 화면 표시용 3단계로 바꾼다. 높음의 기준은 복장(getUvGrade)과 같다.
 * @param uvIndex 자외선 지수
 */
export function getUvLevel(uvIndex: number): UvLevel {
  if (uvIndex <= UV_LOW_MAX) return '낮음';
  return uvIndex >= OUTFIT_UV_HIGH_MIN ? '높음' : '보통';
}

/**
 * 제약사항 때문에 마스크를 추천해야 하는지 판단한다. (미세먼지 나쁨 자체는 shouldRecommendMask가 본다)
 * 천식·비염은 미세먼지가 보통 이상, 미세먼지 민감은 나쁨 이상일 때 추천한다.
 * @param constraint 제약사항
 * @param pm10 PM10 농도(㎍/㎥)
 */
export function isMaskNeededFor(constraint: Constraint, pm10: number): boolean {
  const grade = getDustGrade(pm10);
  if (constraint === 'asthma' || constraint === 'rhinitis') return grade !== '좋음';
  if (constraint === 'dustSensitive') return isBadDustGrade(grade);
  return false;
}

/**
 * 마스크를 추천해야 하는지 판단한다. (복장·더미 가이드·AI 가이드 공통)
 * 미세먼지가 나쁨 이상이면 제약사항과 무관하게 추천하고,
 * 그 밖에는 체크한 제약사항 중 하나라도 조건을 만족할 때 추천한다.
 * @param constraints 사용자가 체크한 제약사항
 * @param pm10 PM10 농도(㎍/㎥)
 */
export function shouldRecommendMask(constraints: Constraint[], pm10: number): boolean {
  if (isBadDustGrade(getDustGrade(pm10))) return true;
  return constraints.some((constraint) => isMaskNeededFor(constraint, pm10));
}
