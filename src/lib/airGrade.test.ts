import { describe, expect, it } from 'vitest';
import {
  DUST_UNAVAILABLE_LABEL,
  formatDust,
  formatDustDetail,
  getDustGrade,
  getOverallDustGrade,
  getPm25Grade,
  getUvGrade,
  getUvLevel,
  hasDustData,
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

  it('150 이하는 나쁨, 151 이상은 매우나쁨이다', () => {
    expect(getDustGrade(150)).toBe('나쁨');
    expect(getDustGrade(151)).toBe('매우나쁨');
    expect(getDustGrade(300)).toBe('매우나쁨');
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

  it('매우나쁨에서도 마스크를 추천하고, 미세먼지 민감도 마스크가 필요하다', () => {
    expect(shouldRecommendMask([], 151)).toBe(true);
    expect(isMaskNeededFor('dustSensitive', 151)).toBe(true);
    expect(isMaskNeededFor('asthma', 151)).toBe(true);
  });

  it('천식은 보통에서도, 미세먼지 민감은 나쁨에서만 마스크를 추천한다', () => {
    expect(shouldRecommendMask(['asthma', 'dustSensitive'], 50)).toBe(true);
    expect(shouldRecommendMask(['dustSensitive'], 50)).toBe(false);
    expect(shouldRecommendMask(['kneeIssue'], 17)).toBe(false);
  });
});

describe('비염 마스크 기준', () => {
  it('천식과 같이 PM10이 보통 이상이면 추천한다', () => {
    expect(isMaskNeededFor('rhinitis', 30)).toBe(false);
    expect(isMaskNeededFor('rhinitis', 31)).toBe(true);
  });
});

describe('getUvLevel', () => {
  it('2 이하는 낮음, 3~5는 보통, 6 이상은 높음이다', () => {
    expect(getUvLevel(0)).toBe('낮음');
    expect(getUvLevel(2)).toBe('낮음');
    expect(getUvLevel(3)).toBe('보통');
    expect(getUvLevel(5)).toBe('보통');
    expect(getUvLevel(6)).toBe('높음');
  });

  it('높음 기준이 복장의 getUvGrade와 같다', () => {
    for (const uv of [0, 3, 5, 6, 9]) {
      expect(getUvLevel(uv) === '높음').toBe(getUvGrade(uv) === '높음');
    }
  });
});

describe('값 없음 처리', () => {
  it('출처가 none이면 값이 없는 것으로 본다', () => {
    expect(hasDustData({ pm10Source: 'none' })).toBe(false);
    expect(hasDustData({ pm10Source: 'model' })).toBe(true);
    expect(hasDustData({})).toBe(true);
  });

  it('값이 없으면 "확인 불가", 있으면 등급과 값을 보여준다', () => {
    expect(formatDust({ pm10: 0, pm10Source: 'none' })).toBe(DUST_UNAVAILABLE_LABEL);
    expect(formatDust({ pm10: 94, pm10Source: 'observed' })).toBe('나쁨 (94)');
  });
});

describe('초미세먼지(PM2.5) 등급', () => {
  it('15 이하 좋음, 35 이하 보통, 75 이하 나쁨, 76 이상 매우나쁨이다', () => {
    expect(getPm25Grade(15)).toBe('좋음');
    expect(getPm25Grade(16)).toBe('보통');
    expect(getPm25Grade(35)).toBe('보통');
    expect(getPm25Grade(36)).toBe('나쁨');
    expect(getPm25Grade(75)).toBe('나쁨');
    expect(getPm25Grade(76)).toBe('매우나쁨');
  });

  it('미세먼지와 초미세먼지 중 나쁜 쪽 등급을 쓴다', () => {
    expect(getOverallDustGrade(20, 40)).toBe('나쁨');
    expect(getOverallDustGrade(90, 10)).toBe('나쁨');
    expect(getOverallDustGrade(20, 80)).toBe('매우나쁨');
    expect(getOverallDustGrade(20)).toBe('좋음');
    expect(getOverallDustGrade(50, 10)).toBe('보통');
  });

  it('초미세먼지만 나빠도 마스크를 추천한다', () => {
    expect(shouldRecommendMask([], 20, 40)).toBe(true);
    expect(shouldRecommendMask([], 20, 10)).toBe(false);
    expect(isMaskNeededFor('asthma', 20, 20)).toBe(true);
    expect(isMaskNeededFor('dustSensitive', 20, 40)).toBe(true);
  });

  it('초미세먼지 값이 있으면 등급과 두 값을 따로 보여준다', () => {
    const weather = { pm10: 60, pm25: 40, pm10Source: 'observed' as const };
    expect(formatDust(weather)).toBe('나쁨');
    expect(formatDustDetail(weather)).toBe('PM10 60 · PM2.5 40');
  });

  it('초미세먼지 값이 없으면 지금처럼 등급과 PM10만 보여주고 부가 문구는 없다', () => {
    expect(formatDust({ pm10: 60, pm10Source: 'model' })).toBe('보통 (60)');
    expect(formatDustDetail({ pm10: 60, pm10Source: 'model' })).toBeNull();
  });

  it('미세먼지 값이 없으면 부가 문구도 없다', () => {
    expect(formatDustDetail({ pm10: 0, pm25: 10, pm10Source: 'none' })).toBeNull();
  });
});
