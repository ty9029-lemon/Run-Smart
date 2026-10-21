import { describe, expect, it } from 'vitest';
import { recommendOutfit } from '../lib/outfit';
import { calcPersonalFeelsLike } from '../lib/feelsLike';
import type { Sensitivity, Weather } from '../types';
import { buildGuideRequest } from './guideService';

const WEATHER: Weather = {
  temp: 16,
  humidity: 44,
  windSpeed: 1.5,
  precipitation: 0,
  condition: '맑음',
  pm10: 20,
  uvIndex: 2.8,
  isDay: true,
};
const SENSITIVITY: Sensitivity = { coldLevel: 3, heatLevel: 3, feedbackOffset: 0 };

describe('buildGuideRequest 복장 목록', () => {
  it('화면의 복장 카드와 같은 이름을 담아 가이드가 다른 옷을 권하지 않게 한다', () => {
    const request = buildGuideRequest({
      activity: 'running',
      sensitivity: SENSITIVITY,
      constraints: [],
      weather: WEATHER,
      location: '서울 강남구',
    });
    const feltTemp = calcPersonalFeelsLike(WEATHER, SENSITIVITY);
    const expected = recommendOutfit(feltTemp, WEATHER, 'running', []).map((item) => item.label);
    expect(request.outfitLabels).toEqual(expected);
    expect(expected.length).toBeGreaterThan(0);
  });
});

describe('buildGuideRequest 러닝 저녁 구간', () => {
  const input = (activity: 'running' | 'cycling', weather: Weather) => ({
    activity,
    sensitivity: SENSITIVITY,
    constraints: [],
    weather,
    location: '서울 강남구',
  });
  const EVENING: Weather = { ...WEATHER, isDay: false, hour: 19 };

  it('해 진 뒤 21시 전 러닝이면 eveningRun을 true로 보낸다', () => {
    expect(buildGuideRequest(input('running', EVENING)).eveningRun).toBe(true);
  });

  it('22시 이후, 낮, 다른 활동에는 보내지 않는다', () => {
    expect(buildGuideRequest(input('running', { ...EVENING, hour: 22 })).eveningRun).toBeUndefined();
    expect(buildGuideRequest(input('running', WEATHER)).eveningRun).toBeUndefined();
    expect(buildGuideRequest(input('cycling', EVENING)).eveningRun).toBeUndefined();
  });
});
