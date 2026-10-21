import { describe, expect, it } from 'vitest';
import { OUTFIT_ICON_KEYS } from '../constants/outfitIcons';
import type { Activity, Weather } from '../types';
import { calcFeelsLike } from './feelsLike';
import { groupOutfitByCategory, recommendOutfit } from './outfit';
import { listOutfitIconFileKeys, outfitIconUrl } from './outfitIconUrls';

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
    expect(labels(13, 'walking')).toContain('바람막이/재킷');
    expect(labels(14, 'walking')).toContain('가디건/얇은 겉옷');
    expect(labels(18, 'walking')).toContain('가디건/얇은 겉옷');
    expect(labels(19, 'walking')).toContain('얇은 긴팔 상의');
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

  it('바람·어두움 장비는 더하지 않는다', () => {
    const result = labels(20, 'walking', { windSpeed: 12, isDay: false });
    expect(result).toEqual(labels(20, 'walking'));
  });

  it('자외선이 강하면 선글라스만 더하고 모자·선크림은 더하지 않는다', () => {
    const result = labels(20, 'walking', { uvIndex: 9 });
    expect(result).toContain('선글라스');
    expect(result).not.toContain('선글라스/고글');
    expect(result).not.toContain('선크림');
  });
});

describe('recommendOutfit - 러닝', () => {
  it('체감 17~22°C에서 기능성 반팔과 러닝 쇼츠를 추천한다', () => {
    expect(labels(17, 'running')).toContain('기능성 반팔 티셔츠');
    expect(labels(22, 'running')).toContain('러닝 쇼츠');
    expect(labels(15, 'running')).not.toContain('기능성 반팔 티셔츠');
  });

  it('추우면 기모 바지와 경량 바람막이, 더우면 민소매를 추천한다', () => {
    expect(labels(-2, 'running')).toEqual(
      expect.arrayContaining(['기모 바지/레깅스', '경량 바람막이', '러닝 장갑·넥워머']),
    );
    expect(labels(-2, 'running')).not.toContain('기모 러닝 타이츠');
    expect(labels(5, 'running')).toEqual(expect.arrayContaining(['긴바지/러닝 레깅스', '경량 바람막이']));
    expect(labels(25, 'running')).toContain('러닝 민소매');
  });

  it('선선한 날에는 러닝 7부 타이츠 대신 긴바지 또는 레깅스를 추천한다', () => {
    expect(labels(16, 'running')).toContain('긴바지 또는 레깅스');
    expect(labels(16, 'running')).not.toContain('러닝 7부 타이츠');
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

  it('밤이거나 일몰이 임박해도 반사 소재 옷과 헤드랜턴은 추천하지 않는다 (AI 가이드가 안내)', () => {
    expect(labels(15, 'running', { isDay: false })).not.toContain('반사 소재 옷');
    expect(labels(15, 'running', { isDay: false })).not.toContain('헤드랜턴');
    expect(labels(15, 'running', { hoursUntilSunset: 0.5 })).not.toContain('반사 소재 옷');
  });

  it('자외선이 강하면 러닝 캡과 선글라스를 더한다', () => {
    expect(labels(15, 'running', { uvIndex: 7 })).toEqual(
      expect.arrayContaining(['러닝 캡', '선글라스/고글']),
    );
  });

  it('자외선이 약하면 선글라스를 추천하지 않는다', () => {
    expect(labels(15, 'running', { uvIndex: 2 })).not.toContain('선글라스/고글');
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

  it('자외선이 강하면 선글라스와 선크림을 더한다', () => {
    expect(labels(20, 'cycling', { uvIndex: 7 })).toEqual(
      expect.arrayContaining(['선글라스/고글', '선크림']),
    );
  });

  it('자외선이 약하면 선글라스를 추천하지 않는다', () => {
    expect(labels(20, 'cycling', { uvIndex: 2 })).not.toContain('선글라스/고글');
  });

  it('반팔·민소매 구간에서는 팔 보호 장비(암워머·쿨 팔토시)를 함께 추천한다', () => {
    expect(labels(16, 'cycling')).toContain('암워머');
    expect(labels(18, 'cycling')).toContain('쿨 팔토시');
    expect(labels(28, 'cycling')).toContain('쿨 팔토시');
  });

  it('긴팔 구간에서는 쿨 팔토시를 추천하지 않는다', () => {
    expect(labels(0, 'cycling')).not.toContain('쿨 팔토시');
    expect(labels(8, 'cycling')).not.toContain('쿨 팔토시');
  });

  it('어느 체감온도에서든 짧은 소매 져지에는 팔 보호 장비가 함께 나온다', () => {
    const shortSleeves = ['반팔 사이클 져지', '민소매 사이클 져지'];
    const armGear = ['암워머', '쿨 팔토시'];
    for (let feelsLike = -10; feelsLike <= 40; feelsLike += 1) {
      const result = labels(feelsLike, 'cycling');
      if (result.some((label) => shortSleeves.includes(label))) {
        expect(result.some((label) => armGear.includes(label)), `${feelsLike}°C`).toBe(true);
      }
    }
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

  it('자외선이 강하면 챙 넓은 모자와 선글라스, 선크림을 더한다', () => {
    expect(labels(20, 'hiking', { uvIndex: 8 })).toEqual(
      expect.arrayContaining(['챙 넓은 모자', '선글라스/고글', '선크림']),
    );
  });

  it('자외선이 약하면 선글라스를 추천하지 않는다', () => {
    expect(labels(20, 'hiking', { uvIndex: 2 })).not.toContain('선글라스/고글');
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

describe('recommendOutfit - 맑은 낮 선글라스/고글', () => {
  /** 선글라스와 고글을 통합 표기하는 운동 활동 (산책은 선글라스로만 표기) */
  const outdoorActivities: Activity[] = ['running', 'cycling', 'hiking'];
  const sunny = { condition: '맑음', isDay: true, uvIndex: 2 };

  it('자외선이 약해도 맑은 낮이면 선글라스/고글을 추천한다', () => {
    outdoorActivities.forEach((activity) => {
      expect(labels(15, activity, sunny)).toContain('선글라스/고글');
    });
  });

  it('맑아도 밤이면 추천하지 않는다', () => {
    outdoorActivities.forEach((activity) => {
      expect(labels(15, activity, { ...sunny, isDay: false })).not.toContain('선글라스/고글');
    });
  });

  it('낮이어도 흐리면 자외선이 약할 때 추천하지 않는다', () => {
    outdoorActivities.forEach((activity) => {
      expect(labels(15, activity, { ...sunny, condition: '흐림' })).not.toContain('선글라스/고글');
    });
  });

  it('맑은 낮에도 자외선이 약하면 모자·선크림은 더하지 않는다', () => {
    const result = labels(15, 'hiking', sunny);
    expect(result).not.toContain('챙 넓은 모자');
    expect(result).not.toContain('선크림');
  });

  it('산책에는 고글 없이 선글라스로만 추천한다', () => {
    const result = labels(15, 'walking', sunny);
    expect(result).toContain('선글라스');
    expect(result).not.toContain('선글라스/고글');
  });

  it('산책도 맑아도 밤이거나 흐리면 추천하지 않는다', () => {
    expect(labels(15, 'walking', { ...sunny, isDay: false })).not.toContain('선글라스');
    expect(labels(15, 'walking', { ...sunny, condition: '흐림' })).not.toContain('선글라스');
  });
});

describe('recommendOutfit - 제약사항', () => {
  const activities: Activity[] = ['walking', 'running', 'cycling', 'hiking'];
  /** 미세먼지 나쁨(PM10 100)이라 마스크 조건을 채우는 날씨 */
  const dusty = weatherWith({ pm10: 100 });

  it('무릎 문제를 체크하면 러닝·자전거·등산에 무릎보호대를 추천한다', () => {
    ['running', 'cycling', 'hiking'].forEach((activity) => {
      const result = recommendOutfit(20, weatherWith(), activity as Activity, ['kneeIssue']).map(
        (i) => i.label,
      );
      expect(result).toContain('무릎보호대');
    });
  });

  it('무릎 문제를 체크해도 산책에는 무릎보호대를 추천하지 않는다', () => {
    const result = recommendOutfit(20, weatherWith(), 'walking', ['kneeIssue']).map((i) => i.label);
    expect(result).not.toContain('무릎보호대');
  });

  it('천식을 체크하고 미세먼지가 나쁘면 모든 활동에 마스크를 추천한다', () => {
    activities.forEach((activity) => {
      const result = recommendOutfit(20, dusty, activity, ['asthma']).map((i) => i.label);
      expect(result).toContain('스포츠 마스크');
    });
  });

  it('미세먼지 민감을 체크해도 나쁠 때만 마스크를 추천하고, 천식과 함께여도 한 번만 나온다', () => {
    const dust = recommendOutfit(20, dusty, 'cycling', ['dustSensitive']);
    expect(dust.map((i) => i.label)).toContain('스포츠 마스크');
    const both = recommendOutfit(20, dusty, 'cycling', ['asthma', 'dustSensitive']);
    expect(both.filter((i) => i.label === '스포츠 마스크')).toHaveLength(1);
  });

  it('제약사항을 체크해도 미세먼지가 좋음이면 마스크를 추천하지 않는다', () => {
    [{ pm10: 17 }, { pm10: 30 }].forEach((overrides) => {
      const result = recommendOutfit(20, weatherWith(overrides), 'running', [
        'asthma',
        'dustSensitive',
      ]).map((i) => i.label);
      expect(result).not.toContain('스포츠 마스크');
    });
  });

  it('미세먼지 민감은 보통에서는 마스크를 추천하지 않는다', () => {
    [{ pm10: 31 }, { pm10: 80 }].forEach((overrides) => {
      const result = recommendOutfit(20, weatherWith(overrides), 'running', [
        'dustSensitive',
      ]).map((i) => i.label);
      expect(result).not.toContain('스포츠 마스크');
    });
  });

  it('천식은 미세먼지가 보통일 때도 모든 활동에 마스크를 추천한다', () => {
    activities.forEach((activity) => {
      const result = recommendOutfit(20, weatherWith({ pm10: 50 }), activity, ['asthma']).map(
        (i) => i.label,
      );
      expect(result).toContain('스포츠 마스크');
    });
  });

  it('제약사항을 체크하지 않아도 미세먼지가 나쁘면 모든 활동에 마스크를 추천한다', () => {
    activities.forEach((activity) => {
      const result = recommendOutfit(20, dusty, activity, []).map((i) => i.label);
      expect(result).toContain('스포츠 마스크');
    });
  });

  it('제약사항이 없고 미세먼지가 보통 이하면 마스크를 추천하지 않는다', () => {
    [17, 50, 80].forEach((pm10) => {
      const result = recommendOutfit(20, weatherWith({ pm10 }), 'running', []).map((i) => i.label);
      expect(result).not.toContain('스포츠 마스크');
    });
  });

  it('체크하지 않았거나 다른 제약사항만 있으면 해당 장비를 추천하지 않는다', () => {
    expect(labels(20, 'running')).not.toContain('무릎보호대');
    expect(labels(20, 'running')).not.toContain('스포츠 마스크');
    const asthma = recommendOutfit(20, dusty, 'running', ['asthma']).map((i) => i.label);
    expect(asthma).not.toContain('무릎보호대');
    const knee = recommendOutfit(20, weatherWith(), 'running', ['kneeIssue']).map((i) => i.label);
    expect(knee).not.toContain('스포츠 마스크');
  });

  it('여러 제약사항을 함께 체크하면 조건이 맞는 장비를 모두 추천한다', () => {
    const result = recommendOutfit(20, dusty, 'hiking', ['kneeIssue', 'asthma']).map((i) => i.label);
    expect(result).toEqual(expect.arrayContaining(['무릎보호대', '스포츠 마스크']));
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

describe('recommendOutfit - 일러스트 키', () => {
  const ACTIVITIES: Activity[] = ['walking', 'running', 'cycling', 'hiking'];
  const FEELS_LIKE_SAMPLES = [-5, 4, 8, 14, 20, 25, 30];
  const ICON_KEY_PATTERN = /^[a-z][A-Za-z]+$/;
  const stormy = weatherWith({ precipitation: 5, windSpeed: 10, uvIndex: 8, pm10: 150, isDay: false });

  it('모든 추천 항목이 이모지가 아닌 영문 일러스트 키를 가진다', () => {
    ACTIVITIES.forEach((activity) => {
      FEELS_LIKE_SAMPLES.forEach((feelsLike) => {
        const items = recommendOutfit(feelsLike, stormy, activity, ['kneeIssue', 'asthma']);
        items.forEach((item) => expect(item.icon).toMatch(ICON_KEY_PATTERN));
      });
    });
  });
});

describe('복장 일러스트 에셋', () => {
  it('모든 아이콘 키에 해당하는 이미지 파일이 있다', () => {
    OUTFIT_ICON_KEYS.forEach((key) => expect(outfitIconUrl(key), key).toBeTruthy());
  });

  it('키 목록에 없는 이미지 파일이 에셋 폴더에 남아 있지 않다', () => {
    expect([...listOutfitIconFileKeys()].sort()).toEqual([...OUTFIT_ICON_KEYS].sort());
  });
});

describe('비염 복장', () => {
  const rhinitisLabels = (temp: number, pm10 = 10) =>
    recommendOutfit(10, weatherWith({ temp, pm10 }), 'running', ['rhinitis']).map((i) => i.label);

  it('찬 공기(5°C 미만)에서만 티슈를 추천한다', () => {
    expect(rhinitisLabels(4)).toContain('티슈');
    expect(rhinitisLabels(5)).not.toContain('티슈');
  });

  it('비염이 아니면 찬 공기여도 티슈를 추천하지 않는다', () => {
    const result = recommendOutfit(0, weatherWith({ temp: 0 }), 'running', []).map((i) => i.label);
    expect(result).not.toContain('티슈');
  });

  it('미세먼지만으로는 티슈가 아니라 스포츠 마스크를 추천한다', () => {
    const result = rhinitisLabels(15, 50);
    expect(result).toContain('스포츠 마스크');
    expect(result).not.toContain('티슈');
  });
});

/** 하의가 짧은 바지(shorts)로 추천되는지 */
function hasShorts(feelsLike: number, activity: Activity): boolean {
  return recommendOutfit(feelsLike, weatherWith(), activity).some(
    (i) => i.category === 'bottom' && i.icon === 'shorts',
  );
}

/** 추천된 하의 라벨 (경계에서 라벨이 어떻게 바뀌는지 확인용) */
function bottomLabel(feelsLike: number, activity: Activity): string | undefined {
  return recommendOutfit(feelsLike, weatherWith(), activity).find((i) => i.category === 'bottom')
    ?.label;
}

/**
 * UT 응답("추운 것 같았는데 반바지를 추천해줌") 재현용 특성화 테스트.
 * 현재 규칙에서 하의가 반바지로 바뀌는 체감온도 경계를 고정해 두어,
 * 규칙을 조정할 때 어느 값이 바뀌는지 바로 드러나게 한다.
 * (러닝 하의 규칙은 #59에서 한파 구간 기모 바지, 선선한 날 긴바지 또는 레깅스로 조정되었다)
 */
describe('recommendOutfit - 반바지가 처음 나오는 체감온도', () => {
  it('산책은 체감 23°C부터 반바지다', () => {
    expect(hasShorts(22, 'walking')).toBe(false);
    expect(hasShorts(23, 'walking')).toBe(true);
  });

  it('러닝은 체감 13°C까지 쌀쌀 구간이라 긴바지/러닝 레깅스를 추천한다', () => {
    expect(bottomLabel(13, 'running')).toBe('긴바지/러닝 레깅스');
    expect(labels(13, 'running')).toContain('경량 바람막이');
  });

  it('러닝은 체감 16°C까지 긴바지 계열이고 17°C부터 반바지(러닝 쇼츠)다', () => {
    expect(bottomLabel(15, 'running')).toBe('긴바지/러닝 레깅스');
    expect(hasShorts(16, 'running')).toBe(false);
    expect(hasShorts(17, 'running')).toBe(true);
  });

  it('러닝은 체감 17°C부터 러닝 쇼츠로 바뀐다', () => {
    expect(bottomLabel(16, 'running')).toBe('긴바지 또는 레깅스');
    expect(bottomLabel(17, 'running')).toBe('러닝 쇼츠');
  });

  it('러닝은 체감 -2°C 이하에서 기모 바지/레깅스다', () => {
    expect(bottomLabel(-2, 'running')).toBe('기모 바지/레깅스');
    expect(bottomLabel(-1, 'running')).toBe('긴바지/러닝 레깅스');
  });

  it('자전거는 체감 14°C부터 짧은 하의(빕숏)다', () => {
    expect(hasShorts(13, 'cycling')).toBe(false);
    expect(hasShorts(14, 'cycling')).toBe(true);
  });

  it('등산은 체감 28°C부터 반바지다 (22°C 이하에서는 반바지가 아니다)', () => {
    expect(hasShorts(22, 'hiking')).toBe(false);
    expect(hasShorts(27, 'hiking')).toBe(false);
    expect(hasShorts(28, 'hiking')).toBe(true);
  });

  it('기온 18°C에 바람 3m/s여도 러닝은 반바지로 나온다 (체감 약 17°C)', () => {
    const windy = weatherWith({ temp: 18, windSpeed: 3 });
    const feelsLike = Math.round(calcFeelsLike(windy));
    expect(feelsLike).toBe(17);
    expect(
      recommendOutfit(feelsLike, windy, 'running').some(
        (i) => i.category === 'bottom' && i.icon === 'shorts',
      ),
    ).toBe(true);
  });
});
