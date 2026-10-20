import { describe, expect, it } from 'vitest';
import type { Activity, Constraint, Weather } from '../types';
import { buildDummyGuide } from './dummyGuide';

/** 조건 없는 맑은 낮 날씨(필요한 값만 덮어쓴다) */
function weatherWith(overrides: Partial<Weather> = {}): Weather {
  return {
    temp: 20,
    humidity: 50,
    windSpeed: 0,
    precipitation: 0,
    condition: '맑음',
    pm10: 17,
    uvIndex: 2,
    isDay: true,
    hoursUntilSunset: 6,
    ...overrides,
  };
}

const SENSITIVITY = { coldLevel: 3, heatLevel: 3 };

/** 더미 가이드의 팁 목록 */
function tips(activity: Activity, weather: Weather, constraints: Constraint[]): string[] {
  return buildDummyGuide(activity, weather, SENSITIVITY, constraints).activityTips;
}

describe('buildDummyGuide - 제약사항 팁', () => {
  it('미세먼지 민감은 좋음·보통이면 마스크 팁을 보여 주지 않는다', () => {
    [17, 30, 80].forEach((pm10) => {
      const result = tips('running', weatherWith({ pm10 }), ['dustSensitive']);
      expect(result).not.toContain('미세먼지 스포츠 마스크 고려');
    });
  });

  it('천식은 미세먼지가 보통이면 마스크 팁을 보여 주고, 좋음이면 보여 주지 않는다', () => {
    expect(tips('running', weatherWith({ pm10: 50 }), ['asthma'])).toContain(
      '미세먼지 스포츠 마스크 고려',
    );
    expect(tips('running', weatherWith({ pm10: 17 }), ['asthma'])).not.toContain(
      '미세먼지 스포츠 마스크 고려',
    );
  });

  it('제약사항이 없어도 미세먼지가 나쁘면 마스크 팁을 보여 준다', () => {
    expect(tips('running', weatherWith({ pm10: 100 }), [])).toContain('미세먼지 스포츠 마스크 고려');
    expect(tips('running', weatherWith({ pm10: 50 }), [])).not.toContain('미세먼지 스포츠 마스크 고려');
  });

  it('천식과 미세먼지 민감을 함께 체크해도 마스크 팁은 한 번만 나온다', () => {
    const result = tips('running', weatherWith({ pm10: 100 }), ['asthma', 'dustSensitive']);
    expect(result.filter((tip) => tip === '미세먼지 스포츠 마스크 고려')).toHaveLength(1);
  });

  it('미세먼지가 나쁨이면 마스크 팁을 보여 준다', () => {
    expect(tips('running', weatherWith({ pm10: 100 }), ['dustSensitive'])).toContain(
      '미세먼지 스포츠 마스크 고려',
    );
  });

  it('무릎 문제 팁은 산책을 뺀 활동에만 보여 준다', () => {
    expect(tips('walking', weatherWith(), ['kneeIssue'])).not.toContain('무릎 보호대 체크');
    expect(tips('hiking', weatherWith(), ['kneeIssue'])).toContain('무릎 보호대 체크');
  });

  it('발 문제를 체크하면 모든 활동에 신발 팁을 보여 준다', () => {
    ['running', 'hiking', 'walking', 'cycling'].forEach((activity) => {
      expect(tips(activity as Activity, weatherWith(), ['footIssue'])).toContain('쿠션 좋은 신발 신기');
    });
  });

  it('발 문제를 체크하지 않으면 신발 팁을 보여 주지 않는다', () => {
    expect(tips('running', weatherWith(), [])).not.toContain('쿠션 좋은 신발 신기');
  });

  it('상세 근거에 날씨 카드와 같은 미세먼지 등급을 적는다', () => {
    const guide = buildDummyGuide('running', weatherWith({ pm10: 17 }), SENSITIVITY, []);
    expect(guide.detailedReason).toContain('미세먼지 좋음(17㎍/㎥)');
  });
});

describe('비염 팁', () => {
  const COLD_TIP = '찬 공기가 콧속을 자극해요. 티슈를 챙기고 넥워머로 코와 입을 가려 보세요';
  const DRY_TIP = '공기가 건조해요. 활동 전후로 물을 충분히 드세요';

  it('찬 공기에서만 찬 공기 팁을 보여 준다', () => {
    expect(tips('running', weatherWith({ temp: 0 }), ['rhinitis'])).toContain(COLD_TIP);
    expect(tips('running', weatherWith({ temp: 15 }), ['rhinitis'])).not.toContain(COLD_TIP);
  });

  it('건조한 공기에서만 건조 팁을 보여 준다', () => {
    expect(tips('running', weatherWith({ humidity: 20 }), ['rhinitis'])).toContain(DRY_TIP);
    expect(tips('running', weatherWith({ humidity: 50 }), ['rhinitis'])).not.toContain(DRY_TIP);
  });

  it('비염이 아니면 보여 주지 않는다', () => {
    expect(tips('running', weatherWith({ temp: 0, humidity: 20 }), [])).not.toContain(COLD_TIP);
  });

  it('PM10이 보통 이상이면 마스크 팁을 보여 준다', () => {
    expect(tips('running', weatherWith({ pm10: 50 }), ['rhinitis'])).toContain(
      '미세먼지 스포츠 마스크 고려',
    );
  });
});

describe('buildDummyGuide - 밤', () => {
  const night = weatherWith({ isDay: false, hoursUntilSunset: -5, uvIndex: 0 });

  it('자외선 민감이어도 밤에는 자외선 차단제 팁을 보여 주지 않는다', () => {
    expect(tips('running', night, ['uvSensitive'])).not.toContain('자외선 차단제 바르기');
  });

  it('낮에는 자외선 민감 팁을 그대로 보여 준다', () => {
    expect(tips('running', weatherWith(), ['uvSensitive'])).toContain('자외선 차단제 바르기');
  });

  it('밤에는 반사 장비와 조명 팁을 덧붙이고, 낮에는 붙이지 않는다', () => {
    expect(tips('running', night, [])).toContain('반사 장비와 조명 챙기기');
    expect(tips('running', weatherWith(), [])).not.toContain('반사 장비와 조명 챙기기');
  });
});
