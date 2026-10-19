import { describe, expect, it } from 'vitest';
import { MIN_REASON_PENALTY } from '../constants/scoreReasons';
import type { Weather } from '../types';
import { NEUTRAL_SENSITIVITY } from './feelsLike';
import { calcScoreBreakdown } from './runScore';
import {
  buildScoreReasons,
  describeRatio,
  formatFactorValue,
  pickTopReasons,
} from './scoreReasons';

/** 러닝 기준 모든 항목이 이상적인 낮 날씨 */
const IDEAL: Weather = {
  temp: 12,
  humidity: 45,
  windSpeed: 2,
  precipitation: 0,
  condition: '맑음',
  pm10: 20,
  uvIndex: 2,
  isDay: true,
};

/** 미세먼지가 나쁜 날씨 */
const DUSTY: Weather = { ...IDEAL, pm10: 150 };

/** 테스트용 계산 도우미 */
function reasonsOf(weather: Weather, constraints: Parameters<typeof calcScoreBreakdown>[2] = []) {
  const breakdown = calcScoreBreakdown(weather, NEUTRAL_SENSITIVITY, constraints, 'running');
  return buildScoreReasons(breakdown, 'running', constraints, weather);
}

describe('buildScoreReasons', () => {
  it('이상적인 날씨는 감점이 없다', () => {
    expect(pickTopReasons(reasonsOf(IDEAL))).toEqual([]);
  });

  it('감점이 큰 항목이 앞에 온다', () => {
    const reasons = reasonsOf(DUSTY);
    expect(reasons[0].key).toBe('dust');
    expect(reasons[0].penalty).toBeGreaterThanOrEqual(MIN_REASON_PENALTY);
  });

  it('받은 점수와 감점의 합이 배점이다', () => {
    reasonsOf(DUSTY).forEach((r) => expect(r.points + r.penalty).toBeCloseTo(r.max, 0));
  });

  it('미세먼지 민감 설정이면 미세먼지 항목에 sensitive가 붙는다', () => {
    const dust = (c: Parameters<typeof reasonsOf>[1]) =>
      reasonsOf(DUSTY, c).find((r) => r.key === 'dust');
    expect(dust([])?.sensitive).toBe(false);
    expect(dust(['dustSensitive'])?.sensitive).toBe(true);
  });

  it('민감 설정이 감점을 키운다', () => {
    const normal = reasonsOf(DUSTY).find((r) => r.key === 'dust');
    const sensitive = reasonsOf(DUSTY, ['asthma']).find((r) => r.key === 'dust');
    expect(sensitive!.penalty).toBeGreaterThan(normal!.penalty);
  });

  it('비염은 찬 공기일 때만 기온 항목이 sensitive다', () => {
    const cold = reasonsOf({ ...IDEAL, temp: 2 }, ['rhinitis']).find((r) => r.key === 'temp');
    const mild = reasonsOf(IDEAL, ['rhinitis']).find((r) => r.key === 'temp');
    expect(cold?.sensitive).toBe(true);
    expect(mild?.sensitive).toBe(false);
  });

  it('상위 이유는 최대 2개다', () => {
    const bad: Weather = { ...DUSTY, windSpeed: 10, precipitation: 3 };
    expect(pickTopReasons(reasonsOf(bad)).length).toBe(2);
  });
});

describe('describeRatio / formatFactorValue', () => {
  it('깎인 비율에 따라 해석이 달라진다', () => {
    expect(describeRatio(0)).toBe('좋아요');
    expect(describeRatio(0.3)).toBe('보통이에요');
    expect(describeRatio(0.9)).toBe('점수를 많이 깎았어요');
  });

  it('값에 단위를 붙인다', () => {
    expect(formatFactorValue('wind', IDEAL, 11)).toBe('2m/s');
    expect(formatFactorValue('feelsLike', IDEAL, 11)).toBe('11°C');
    expect(formatFactorValue('daylight', { ...IDEAL, isDay: false }, 11)).toBe('밤');
  });
});
