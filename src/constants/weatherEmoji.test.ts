import { describe, expect, it } from 'vitest';
import { weatherCodeToCondition } from '../lib/openMeteo';
import { getWeatherEmoji } from './weatherEmoji';

/** WMO 날씨 코드의 최댓값 */
const MAX_WEATHER_CODE = 99;

describe('getWeatherEmoji', () => {
  it('모든 날씨 코드의 문구에 낮·밤 이모지가 있다', () => {
    for (let code = 0; code <= MAX_WEATHER_CODE; code += 1) {
      const condition = weatherCodeToCondition(code);
      expect(getWeatherEmoji(condition, true), `낮 ${condition}`).toBeTruthy();
      expect(getWeatherEmoji(condition, false), `밤 ${condition}`).toBeTruthy();
    }
  });

  it('구름 조금은 낮에 해와 구름, 밤에 구름으로 보여준다', () => {
    expect(getWeatherEmoji('구름 조금', true)).toBe('🌤️');
    expect(getWeatherEmoji('구름 조금', false)).toBe('☁️');
  });

  it('알 수 없는 날씨는 undefined다', () => {
    expect(getWeatherEmoji('알 수 없음', true)).toBeUndefined();
  });
});
