import { describe, expect, it } from 'vitest';
import type { Activity, Weather } from '../types';
import { groupOutfitByCategory, recommendOutfit } from './outfit';

/** 조건 없는 맑은 낮 날씨(필요한 값만 덮어쓴다) */
function weatherWith(overrides: Partial<Weather> = {}): Weather {
  return {
    temp: 20,
    humidity: 50,
    windSpeed: 0,
    precipitation: 0,
    condition: 'clear',
    pm10: 20,
    uvIndex: 2,
    isDay: true,
    hoursUntilSunset: 6,
    ...overrides,
  };
}

/** 추천된 복장 라벨 목록 */
function labels(feelsLike: number, activity: Activity, overrides: Partial<Weather> = {}) {
  return recommendOutfit(feelsLike, weatherWith(overrides), activity).map((i) => i.label);
}

describe('recommendOutfit - 산책(일상복)', () => {
  it('체감 15°C는 반팔·반바지가 아니라 긴팔·긴바지를 추천한다', () => {
    const result = labels(15, 'walking');
    expect(result).not.toContain('반팔 상의');
    expect(result).not.toContain('반바지');
    expect(result).toContain('긴팔 상의');
    expect(result).toContain('긴바지');
  });

  it('체감온도 구간 경계에서 바뀐다', () => {
    expect(labels(4, 'walking')).toContain('패딩/두꺼운 겉옷');
    expect(labels(5, 'walking')).toContain('바람막이/재킷');
    expect(labels(11, 'walking')).toContain('바람막이/재킷');
    expect(labels(12, 'walking')).toContain('가디건/얇은 겉옷');
    expect(labels(16, 'walking')).toContain('가디건/얇은 겉옷');
    expect(labels(17, 'walking')).toContain('얇은 긴팔 상의');
    expect(labels(22, 'walking')).toContain('얇은 긴팔 상의');
    expect(labels(23, 'walking')).toContain('반팔 상의');
    expect(labels(27, 'walking')).toContain('반팔 상의');
    expect(labels(28, 'walking')).toContain('민소매/얇은 반팔');
  });

  it('운동화를 포함하고, 비가 오면 우비/방수를 더한다', () => {
    expect(labels(20, 'walking')).toContain('운동화');
    expect(labels(20, 'walking')).not.toContain('우비/방수');
    expect(labels(20, 'walking', { precipitation: 1 })).toContain('우비/방수');
  });

  it('바람·어두움·자외선 장비는 더하지 않는다', () => {
    const result = labels(20, 'walking', { windSpeed: 12, isDay: false, uvIndex: 9 });
    expect(result).toEqual(labels(20, 'walking'));
  });
});

describe('recommendOutfit - 러닝', () => {
  it('체감 17~22°C에서 기능성 반팔과 러닝 쇼츠를 추천한다', () => {
    expect(labels(17, 'running')).toContain('기능성 반팔 티셔츠');
    expect(labels(22, 'running')).toContain('러닝 쇼츠');
    expect(labels(15, 'running')).not.toContain('기능성 반팔 티셔츠');
  });

  it('추우면 러닝 타이츠와 경량 바람막이, 더우면 민소매를 추천한다', () => {
    expect(labels(-2, 'running')).toEqual(
      expect.arrayContaining(['기모 러닝 타이츠', '경량 바람막이', '러닝 장갑·넥워머']),
    );
    expect(labels(5, 'running')).toEqual(expect.arrayContaining(['러닝 타이츠', '경량 바람막이']));
    expect(labels(25, 'running')).toContain('러닝 민소매');
  });

  it('신발은 러닝화다', () => {
    expect(labels(20, 'running')).toContain('러닝화');
    expect(labels(20, 'running')).not.toContain('운동화');
  });

  it('비가 오면 경량 바람막이 대신 방수 바람막이를 추천한다', () => {
    const result = labels(5, 'running', { precipitation: 2 });
    expect(result).toContain('방수 바람막이');
    expect(result).not.toContain('경량 바람막이');
  });

  it('강풍이면 겉옷이 없는 구간에도 경량 바람막이를 더한다', () => {
    expect(labels(15, 'running')).not.toContain('경량 바람막이');
    expect(labels(15, 'running', { windSpeed: 9 })).toContain('경량 바람막이');
  });

  it('밤이거나 일몰이 임박하면 반사 소재 옷을 더한다 (헤드랜턴은 제외)', () => {
    expect(labels(15, 'running')).not.toContain('반사 소재 옷');
    expect(labels(15, 'running', { isDay: false })).toContain('반사 소재 옷');
    expect(labels(15, 'running', { isDay: false })).not.toContain('헤드랜턴');
    expect(labels(15, 'running', { hoursUntilSunset: 0.5 })).toContain('반사 소재 옷');
  });

  it('자외선이 강하면 러닝 캡과 선글라스를 더한다', () => {
    expect(labels(15, 'running', { uvIndex: 7 })).toEqual(
      expect.arrayContaining(['러닝 캡', '선글라스']),
    );
  });
});

describe('recommendOutfit - 자전거', () => {
  it('체감 20°C는 반팔 사이클 져지와 빕숏을 추천한다', () => {
    const result = labels(20, 'cycling');
    expect(result).toContain('반팔 사이클 져지');
    expect(result).toContain('빕숏');
  });

  it('헬멧을 항상 포함한다', () => {
    expect(labels(0, 'cycling')).toContain('헬멧');
    expect(labels(30, 'cycling')).toContain('헬멧');
  });

  it('추우면 윈드 재킷·빕타이츠·방풍 장갑을 추천한다', () => {
    expect(labels(-5, 'cycling')).toEqual(
      expect.arrayContaining(['윈드 재킷', '기모 빕타이츠', '방풍 장갑']),
    );
  });

  it('비가 오면 방수 재킷과 흙받이를 추천하고 윈드 재킷은 뺀다', () => {
    const result = labels(-5, 'cycling', { precipitation: 1 });
    expect(result).toEqual(expect.arrayContaining(['방수 재킷', '흙받이']));
    expect(result).not.toContain('윈드 재킷');
  });

  it('어두우면 전조등·후미등과 반사 조끼를 더한다', () => {
    expect(labels(20, 'cycling', { isDay: false })).toEqual(
      expect.arrayContaining(['전조등·후미등', '반사 조끼']),
    );
  });
});

describe('recommendOutfit - 등산', () => {
  it('추울수록 겹쳐 입는다 (플리스·경량 패딩·하드쉘)', () => {
    expect(labels(0, 'hiking')).toEqual(
      expect.arrayContaining(['기능성 긴팔 티셔츠', '플리스', '경량 패딩', '하드쉘']),
    );
    expect(labels(8, 'hiking')).toEqual(expect.arrayContaining(['플리스', '소프트쉘']));
    expect(labels(8, 'hiking')).not.toContain('경량 패딩');
  });

  it('체감 20°C는 러닝과 달리 긴팔 기능성 티셔츠를 추천한다', () => {
    expect(labels(20, 'hiking')).toContain('기능성 얇은 긴팔');
    expect(labels(20, 'hiking')).not.toContain('기능성 반팔 티셔츠');
  });

  it('등산화와 등산 양말을 항상 포함한다', () => {
    expect(labels(20, 'hiking')).toEqual(expect.arrayContaining(['등산화', '등산 양말']));
  });

  it('비가 오면 소프트쉘 대신 하드쉘을 추천한다', () => {
    const result = labels(8, 'hiking', { precipitation: 3 });
    expect(result).toContain('하드쉘');
    expect(result).not.toContain('소프트쉘');
    expect(result).toContain('배낭 레인커버');
  });

  it('체감 0°C 이하에서만 아이젠을 안내한다', () => {
    expect(labels(0, 'hiking')).toContain('아이젠');
    expect(labels(1, 'hiking')).not.toContain('아이젠');
    expect(labels(0, 'running')).not.toContain('아이젠');
  });

  it('강풍이면 플리스만 있는 구간에도 소프트쉘을 더한다', () => {
    expect(labels(14, 'hiking')).not.toContain('소프트쉘');
    expect(labels(14, 'hiking', { windSpeed: 10 })).toContain('소프트쉘');
  });

  it('자외선이 강하면 챙 넓은 모자와 선크림을 더한다', () => {
    expect(labels(20, 'hiking', { uvIndex: 8 })).toEqual(
      expect.arrayContaining(['챙 넓은 모자', '선크림']),
    );
  });
});

describe('recommendOutfit - 공통', () => {
  const activities: Activity[] = ['walking', 'running', 'cycling', 'hiking'];

  it('어떤 조건에서도 같은 라벨이 중복되지 않는다', () => {
    const harsh = { precipitation: 5, windSpeed: 12, isDay: false, uvIndex: 9 };
    activities.forEach((activity) => {
      [-10, 0, 10, 20, 30].forEach((feelsLike) => {
        const result = labels(feelsLike, activity, harsh);
        expect(new Set(result).size).toBe(result.length);
      });
    });
  });
});

describe('recommendOutfit - 제약사항', () => {
  const activities: Activity[] = ['walking', 'running', 'cycling', 'hiking'];

  it('무릎 문제를 체크하면 모든 활동에 무릎보호대를 추천한다', () => {
    activities.forEach((activity) => {
      const result = recommendOutfit(20, weatherWith(), activity, ['kneeIssue']).map((i) => i.label);
      expect(result).toContain('무릎보호대');
    });
  });

  it('천식을 체크하면 모든 활동에 마스크를 추천한다', () => {
    activities.forEach((activity) => {
      const result = recommendOutfit(20, weatherWith(), activity, ['asthma']).map((i) => i.label);
      expect(result).toContain('마스크');
    });
  });

  it('체크하지 않았거나 다른 제약사항만 있으면 해당 장비를 추천하지 않는다', () => {
    expect(labels(20, 'running')).not.toContain('무릎보호대');
    expect(labels(20, 'running')).not.toContain('마스크');
    const asthma = recommendOutfit(20, weatherWith(), 'running', ['asthma']).map((i) => i.label);
    expect(asthma).not.toContain('무릎보호대');
    const knee = recommendOutfit(20, weatherWith(), 'running', ['kneeIssue']).map((i) => i.label);
    expect(knee).not.toContain('마스크');
  });

  it('여러 제약사항을 함께 체크하면 장비를 모두 추천한다', () => {
    const result = recommendOutfit(20, weatherWith(), 'hiking', ['kneeIssue', 'asthma']).map(
      (i) => i.label,
    );
    expect(result).toEqual(expect.arrayContaining(['무릎보호대', '마스크']));
  });
});

describe('groupOutfitByCategory', () => {
  it('상의·겉옷·하의·신발·장비 순서로 묶고 빈 분류는 뺀다', () => {
    const items = recommendOutfit(8, weatherWith(), 'hiking');
    const groups = groupOutfitByCategory(items);
    expect(groups.map((g) => g.category)).toEqual(['top', 'outer', 'bottom', 'shoes']);
    expect(groups.flatMap((g) => g.items)).toHaveLength(items.length);
  });
});
