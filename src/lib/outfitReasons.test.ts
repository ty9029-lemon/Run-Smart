import { describe, expect, it } from 'vitest';
import type { Activity, Constraint, Weather } from '../types';
import { recommendOutfit } from './outfit';
import { buildOutfitReason } from './outfitReasons';

/** 조건 없는 맑은 낮 날씨(필요한 값만 덮어쓴다) */
function weatherWith(overrides: Partial<Weather> = {}): Weather {
  return {
    temp: 20,
    humidity: 50,
    windSpeed: 0,
    precipitation: 0,
    condition: '흐림',
    pm10: 20,
    uvIndex: 2,
    isDay: true,
    hoursUntilSunset: 6,
    ...overrides,
  };
}

/** 추천 복장과 근거를 함께 만든다 */
function reasonOf(
  feelsLike: number,
  activity: Activity,
  overrides: Partial<Weather> = {},
  constraints: Constraint[] = [],
) {
  const weather = weatherWith(overrides);
  const outfit = recommendOutfit(feelsLike, weather, activity, constraints);
  return buildOutfitReason(feelsLike, weather, activity, outfit);
}

describe('buildOutfitReason - 기본 근거', () => {
  it('체감온도와 상의·겉옷·하의 이름을 보여준다', () => {
    const { base } = reasonOf(15, 'walking');
    expect(base).toContain('체감 15°C');
    expect(base).toContain('긴팔 상의');
    expect(base).toContain('긴바지');
  });

  it('러닝·자전거는 운동 중 체온 상승 반영을 덧붙인다', () => {
    expect(reasonOf(10, 'running').base).toContain('체온이 올라');
    expect(reasonOf(10, 'cycling').base).toContain('체온이 올라');
    expect(reasonOf(10, 'walking').base).not.toContain('체온이 올라');
  });

  it('조건 근거로 설명한 항목은 기본 근거에서 뺀다', () => {
    const { base, extras } = reasonOf(10, 'running', { precipitation: 2 });
    expect(extras[0]).toContain('방수 바람막이');
    expect(base).not.toContain('방수 바람막이');
  });
});

describe('buildOutfitReason - 조건 근거', () => {
  it('조건이 없으면 조건 근거가 없다', () => {
    expect(reasonOf(15, 'walking').extras).toEqual([]);
  });

  it('비가 오면 방수 장비를 이유와 함께 보여준다', () => {
    expect(reasonOf(15, 'walking', { precipitation: 2 }).extras[0]).toBe('비가 와서 우비/방수');
  });

  it('강풍이면 방풍 겉옷을 이유와 함께 보여준다', () => {
    const { extras } = reasonOf(15, 'running', { windSpeed: 10 });
    expect(extras[0]).toContain('바람이 강해');
    expect(extras[0]).toContain('경량 바람막이');
  });

  it('바람이 약하면 기본 구간표의 바람막이는 바람 때문이라고 하지 않는다', () => {
    expect(reasonOf(10, 'running').extras).toEqual([]);
  });

  it('미세먼지 나쁨이면 마스크를 설명한다', () => {
    expect(reasonOf(15, 'walking', { pm10: 120 }).extras[0]).toContain('스포츠 마스크');
  });

  it('비염 설정에 따른 장비를 설명한다', () => {
    expect(reasonOf(15, 'running', { temp: 2 }, ['rhinitis']).extras[0]).toContain('티슈');
  });

  it('무릎 설정의 무릎보호대는 AI 가이드와 아이콘이 알려주므로 근거 줄에 쓰지 않는다', () => {
    expect(reasonOf(15, 'running', {}, ['kneeIssue']).extras).toEqual([]);
  });

  it('햇빛이 강하면 러닝 모자·선글라스/고글을 챙기면 좋다는 문장으로 끝낸다', () => {
    const { extras } = reasonOf(15, 'running', { condition: '맑음', isDay: true, uvIndex: 2 });
    expect(extras[0]).toBe('햇빛이 강해 러닝 모자·선글라스/고글을 챙기면 좋아요.');
  });

  it('산책은 선글라스만 "를"로 이어 문장으로 끝낸다', () => {
    const { extras } = reasonOf(15, 'walking', { condition: '맑음', isDay: true, uvIndex: 2 });
    expect(extras[0]).toBe('햇빛이 강해 선글라스를 챙기면 좋아요.');
  });

  it('조건 근거는 우선순위 순서로 최대 2개만 보여준다', () => {
    const { extras } = reasonOf(15, 'cycling', {
      precipitation: 2,
      windSpeed: 10,
      uvIndex: 8,
      pm10: 120,
    });
    expect(extras).toHaveLength(2);
    expect(extras[0]).toContain('비가 와서');
  });

  it('근거에 나오는 장비는 모두 추천 복장에 들어 있다', () => {
    const weather = weatherWith({ precipitation: 2, windSpeed: 10, uvIndex: 8, pm10: 120 });
    const outfit = recommendOutfit(8, weather, 'cycling', ['kneeIssue']);
    const labels = outfit.map((item) => item.label);
    const { extras } = buildOutfitReason(8, weather, 'cycling', outfit);
    extras.forEach((extra) => expect(labels.some((label) => extra.includes(label))).toBe(true));
  });
});
