import { describe, expect, it } from 'vitest';
import {
  SENSITIVITY_DEGREE_PER_LEVEL,
  SENSITIVITY_MAX,
  SENSITIVITY_MIN,
} from '../constants/thresholds';
import type { Weather } from '../types';
import {
  NEUTRAL_SENSITIVITY,
  calcAppliedOffset,
  calcFeelsLike,
  calcPersonalFeelsLike,
  calcSensitivityAdjust,
} from './feelsLike';

/** 바람·습도 영향이 없어 체감온도가 기온과 같은 날씨 */
function weatherAt(temp: number): Weather {
  return {
    temp,
    humidity: 50,
    windSpeed: 0,
    precipitation: 0,
    condition: '맑음',
    pm10: 20,
    uvIndex: 2,
    isDay: true,
  };
}

const COLD_TEMP = 5;
const HOT_TEMP = 25;
const MAX_ADJUST = (SENSITIVITY_MAX - 3) * SENSITIVITY_DEGREE_PER_LEVEL;

describe('calcSensitivityAdjust', () => {
  it('모두 보통이면 어떤 날씨에서도 보정이 없다', () => {
    expect(calcSensitivityAdjust(COLD_TEMP, NEUTRAL_SENSITIVITY)).toBe(0);
    expect(calcSensitivityAdjust(HOT_TEMP, NEUTRAL_SENSITIVITY)).toBe(0);
  });

  it('추위 민감도는 쌀쌀한 날에만 더 춥게 반영된다', () => {
    const coldSensitive = { coldLevel: SENSITIVITY_MAX, heatLevel: 3 };
    expect(calcSensitivityAdjust(COLD_TEMP, coldSensitive)).toBe(-MAX_ADJUST);
    expect(calcSensitivityAdjust(HOT_TEMP, coldSensitive)).toBe(0);
  });

  it('더위 민감도는 더운 날에만 더 덥게 반영된다', () => {
    const heatSensitive = { coldLevel: 3, heatLevel: SENSITIVITY_MAX };
    expect(calcSensitivityAdjust(HOT_TEMP, heatSensitive)).toBe(MAX_ADJUST);
    expect(calcSensitivityAdjust(COLD_TEMP, heatSensitive)).toBe(0);
  });

  it('추위를 덜 타면(아니오) 쌀쌀한 날 덜 춥게 느낀다', () => {
    const hardy = { coldLevel: SENSITIVITY_MIN, heatLevel: 3 };
    expect(calcSensitivityAdjust(COLD_TEMP, hardy)).toBe(MAX_ADJUST);
  });

  it('기준 온도 근처에서는 보정이 연속적으로 변한다', () => {
    const coldSensitive = { coldLevel: SENSITIVITY_MAX, heatLevel: 3 };
    const nearReference = calcSensitivityAdjust(14, coldSensitive);
    expect(nearReference).toBeLessThan(0);
    expect(nearReference).toBeGreaterThan(-1);
    expect(calcSensitivityAdjust(15, coldSensitive)).toBe(0);
  });
});

describe('calcPersonalFeelsLike', () => {
  it('민감도가 보통이면 객관적 체감온도를 반올림한 값과 같다', () => {
    const weather = weatherAt(12);
    expect(calcPersonalFeelsLike(weather, NEUTRAL_SENSITIVITY)).toBe(
      Math.round(calcFeelsLike(weather)),
    );
  });

  it('추위를 많이 타면 쌀쌀한 날 더 춥게 느낀다', () => {
    const coldSensitive = { coldLevel: SENSITIVITY_MAX, heatLevel: 3 };
    const weather = weatherAt(COLD_TEMP);
    expect(calcPersonalFeelsLike(weather, coldSensitive)).toBe(COLD_TEMP - MAX_ADJUST);
  });
});

describe('calcAppliedOffset', () => {
  it('개인 체감온도와 객관 체감온도의 차이를 돌려준다', () => {
    const heatSensitive = { coldLevel: 3, heatLevel: SENSITIVITY_MAX };
    expect(calcAppliedOffset(weatherAt(HOT_TEMP), heatSensitive)).toBe(MAX_ADJUST);
    expect(calcAppliedOffset(weatherAt(HOT_TEMP), NEUTRAL_SENSITIVITY)).toBe(0);
  });
});
