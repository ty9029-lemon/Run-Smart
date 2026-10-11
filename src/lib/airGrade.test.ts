import { describe, expect, it } from 'vitest';
import {
  getDustGrade,
  getUvGrade,
  isMaskNeededFor,
  shouldRecommendMask,
} from './airGrade';

describe('getDustGrade', () => {
  it('30 이하는 좋음, 31~80은 보통, 81 이상은 나쁨이다', () => {
    expect(getDustGrade(17)).toBe('좋음');
    expect(getDustGrade(30)).toBe('좋음');
    expect(getDustGrade(31)).toBe('보통');
    expect(getDustGrade(80)).toBe('보통');
    expect(getDustGrade(81)).toBe('나쁨');
  });
});

describe('getUvGrade', () => {
  it('6 미만은 보통, 6 이상은 높음이다', () => {
    expect(getUvGrade(5.2)).toBe('보통');
    expect(getUvGrade(5.9)).toBe('보통');
    expect(getUvGrade(6)).toBe('높음');
  });
});

describe('마스크 규칙', () => {
  it('천식은 미세먼지가 보통 이상일 때, 미세먼지 민감은 나쁨일 때 마스크가 필요하다', () => {
    expect(isMaskNeededFor('asthma', 30)).toBe(false);
    expect(isMaskNeededFor('asthma', 31)).toBe(true);
    expect(isMaskNeededFor('asthma', 100)).toBe(true);
    expect(isMaskNeededFor('dustSensitive', 80)).toBe(false);
    expect(isMaskNeededFor('dustSensitive', 81)).toBe(true);
    expect(isMaskNeededFor('kneeIssue', 100)).toBe(false);
  });

  it('미세먼지가 나쁨이면 제약사항이 없어도 마스크를 추천한다', () => {
    expect(shouldRecommendMask([], 81)).toBe(true);
    expect(shouldRecommendMask([], 80)).toBe(false);
  });

  it('천식은 보통에서도, 미세먼지 민감은 나쁨에서만 마스크를 추천한다', () => {
    expect(shouldRecommendMask(['asthma', 'dustSensitive'], 50)).toBe(true);
    expect(shouldRecommendMask(['dustSensitive'], 50)).toBe(false);
    expect(shouldRecommendMask(['kneeIssue'], 17)).toBe(false);
  });
});
