import { OUTFIT_UV_HIGH_MIN, PM10_GOOD, PM10_NORMAL } from '../constants/thresholds';
import type { Constraint, DustGrade, UvGrade } from '../types';

/**
 * 미세먼지(PM10) 농도를 등급으로 바꾼다. 날씨 카드·복장·AI 가이드가 같은 기준을 쓴다.
 * @param pm10 PM10 농도(㎍/㎥)
 */
export function getDustGrade(pm10: number): DustGrade {
  if (pm10 <= PM10_GOOD) return '좋음';
  if (pm10 <= PM10_NORMAL) return '보통';
  return '나쁨';
}

/**
 * 자외선 지수를 등급으로 바꾼다. 복장의 선글라스·선크림 기준과 같다.
 * @param uvIndex 자외선 지수
 */
export function getUvGrade(uvIndex: number): UvGrade {
  return uvIndex >= OUTFIT_UV_HIGH_MIN ? '높음' : '보통';
}

/**
 * 제약사항 때문에 마스크를 추천해야 하는지 판단한다. (미세먼지 나쁨 자체는 shouldRecommendMask가 본다)
 * 천식·비염은 미세먼지가 보통 이상, 미세먼지 민감은 나쁨일 때 추천한다.
 * @param constraint 제약사항
 * @param pm10 PM10 농도(㎍/㎥)
 */
export function isMaskNeededFor(constraint: Constraint, pm10: number): boolean {
  const grade = getDustGrade(pm10);
  if (constraint === 'asthma' || constraint === 'rhinitis') return grade !== '좋음';
  if (constraint === 'dustSensitive') return grade === '나쁨';
  return false;
}

/**
 * 마스크를 추천해야 하는지 판단한다. (복장·더미 가이드·AI 가이드 공통)
 * 미세먼지가 나쁨이면 제약사항과 무관하게 추천하고,
 * 그 밖에는 체크한 제약사항 중 하나라도 조건을 만족할 때 추천한다.
 * @param constraints 사용자가 체크한 제약사항
 * @param pm10 PM10 농도(㎍/㎥)
 */
export function shouldRecommendMask(constraints: Constraint[], pm10: number): boolean {
  if (getDustGrade(pm10) === '나쁨') return true;
  return constraints.some((constraint) => isMaskNeededFor(constraint, pm10));
}
