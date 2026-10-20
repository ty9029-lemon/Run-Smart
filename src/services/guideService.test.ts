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
