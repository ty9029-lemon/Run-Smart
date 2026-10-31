import { describe, expect, it } from 'vitest';
import { MIN_REASON_PENALTY } from '../constants/scoreReasons';
import type { Constraint, Weather } from '../types';
import { NEUTRAL_SENSITIVITY } from './feelsLike';
import { calcScoreBreakdown } from './runScore';
import {
  buildScoreDeltas,
  buildScoreReasons,
  describeRatio,
  ratioToLevel,
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

describe('ratioToLevel', () => {
  it('깎인 비율에 따라 좋음·보통·나쁨으로 나눈다', () => {
    expect(ratioToLevel(0)).toBe('good');
    expect(ratioToLevel(0.3)).toBe('caution');
    expect(ratioToLevel(0.9)).toBe('careful');
  });
});

describe('describeRatio / formatFactorValue', () => {
  it('깎인 비율에 따라 해석이 달라진다', () => {
    expect(describeRatio(0)).toBe('좋아요');
    expect(describeRatio(0.3)).toBe('보통이에요');
    expect(describeRatio(0.9)).toBe('점수를 많이 깎았어요');
  });

  it('값에 단위를 붙인다', () => {
    expect(formatFactorValue('wind', IDEAL, 11, 'running')).toBe('2m/s');
    expect(formatFactorValue('feelsLike', IDEAL, 11, 'running')).toBe('11°C');
  });

  it('일조 시간은 해 떠 있음과 해 짐으로 보여준다', () => {
    expect(formatFactorValue('daylight', IDEAL, 11, 'running')).toBe('해 떠 있음');
    expect(formatFactorValue('daylight', { ...IDEAL, isDay: false }, 11, 'running')).toBe('해 짐');
  });

  it('등산·자전거는 일몰까지 남은 시간을 보여준다', () => {
    const afternoon = { ...IDEAL, hoursUntilSunset: 2.46 };
    expect(formatFactorValue('daylight', afternoon, 11, 'hiking')).toBe('일몰까지 2.5시간');
    expect(formatFactorValue('daylight', afternoon, 11, 'running')).toBe('해 떠 있음');
    expect(formatFactorValue('daylight', IDEAL, 11, 'hiking')).toBe('해 떠 있음');
  });
});

describe('buildScoreDeltas', () => {
  const breakdownOf = (weather: Weather) =>
    calcScoreBreakdown(weather, NEUTRAL_SENSITIVITY, [], 'running');

  it('같은 날씨면 차이가 없다', () => {
    expect(buildScoreDeltas(breakdownOf(IDEAL), breakdownOf(IDEAL))).toEqual([]);
  });

  it('지금보다 나아진 항목은 양수, 나빠진 항목은 음수다', () => {
    const better = buildScoreDeltas(breakdownOf(IDEAL), breakdownOf(DUSTY));
    expect(better[0].key).toBe('dust');
    expect(better[0].diff).toBeGreaterThan(0);
    const worse = buildScoreDeltas(breakdownOf(DUSTY), breakdownOf(IDEAL));
    expect(worse[0].diff).toBeLessThan(0);
  });

  it('기준보다 작은 차이는 뺀다', () => {
    const slightlyWindy: Weather = { ...IDEAL, windSpeed: 3.5 };
    expect(buildScoreDeltas(breakdownOf(slightlyWindy), breakdownOf(IDEAL))).toEqual([]);
  });

  it('차이가 큰 항목 최대 2개만 큰 순서로 고른다', () => {
    const bad: Weather = {
      ...IDEAL,
      pm10: 150,
      windSpeed: 10,
      precipitation: 3,
    };
    const deltas = buildScoreDeltas(breakdownOf(bad), breakdownOf(IDEAL));
    expect(deltas).toHaveLength(2);
    expect(Math.abs(deltas[0].diff)).toBeGreaterThanOrEqual(Math.abs(deltas[1].diff));
  });
});

describe('buildScoreReasons: 밤', () => {
  const NIGHT: Weather = { ...IDEAL, isDay: false };

  it('러닝은 밤이면 일조 시간이 가장 큰 감점(−35점)으로 나온다', () => {
    const reasons = reasonsOf(NIGHT);
    expect(reasons[0].key).toBe('daylight');
    expect(reasons[0].penalty).toBe(35);
    expect(reasons[0].max).toBe(35);
    expect(reasons[0].points).toBe(0);
    expect(reasons[0].ratio).toBe(1);
  });

  it('점수에 음수 칸이 나오지 않는다', () => {
    for (const r of reasonsOf(NIGHT)) expect(r.points).toBeGreaterThanOrEqual(0);
  });

  it('낮에는 일조 시간이 감점이 아니다', () => {
    const daylight = reasonsOf(IDEAL).find((r) => r.key === 'daylight');
    expect(daylight?.penalty).toBe(0);
    expect(daylight?.max).toBe(5);
  });

  it('등산은 배점표가 일조를 우선하므로 추가 감점 없이 35점이 깎인다', () => {
    const w = NIGHT;
    const breakdown = calcScoreBreakdown(w, NEUTRAL_SENSITIVITY, [], 'hiking');
    const daylight = buildScoreReasons(breakdown, 'hiking', [], w).find((r) => r.key === 'daylight');
    expect(daylight?.penalty).toBe(35);
    expect(daylight?.max).toBe(35);
  });

  it('점수 한 줄 요약에 "일조 시간 −35점"이 보인다', () => {
    const top = pickTopReasons(reasonsOf(NIGHT));
    expect(top[0].label).toBe('일조 시간');
    expect(top[0].penalty).toBe(35);
  });
});

describe("buildScoreReasons: 미세먼지 '나쁨' 상한", () => {
  const BAD: Weather = { ...IDEAL, pm10: 85 };
  const constraints: Constraint[] = ['dustSensitive'];

  it('감점 합계가 100점에서 총점을 뺀 값과 같고, 가장 큰 이유는 미세먼지다', () => {
    const breakdown = calcScoreBreakdown(BAD, NEUTRAL_SENSITIVITY, constraints, 'running');
    const reasons = buildScoreReasons(breakdown, 'running', constraints, BAD);
    const total = Math.round(Object.values(breakdown).reduce((a, b) => a + b, 0));
    const penaltySum = reasons.reduce((sum, r) => sum + r.penalty, 0);
    expect(Math.abs(100 - total - penaltySum)).toBeLessThanOrEqual(1);
    expect(reasons[0].key).toBe('dust');
    expect(reasons[0].ratio).toBe(1);
  });

  it('표시용 만점·감점·점수는 모두 정수다', () => {
    const breakdown = calcScoreBreakdown(BAD, NEUTRAL_SENSITIVITY, constraints, 'running');
    const dust = buildScoreReasons(breakdown, 'running', constraints, BAD).find(
      (r) => r.key === 'dust',
    );
    expect(Number.isInteger(dust?.max)).toBe(true);
    expect(Number.isInteger(dust?.points)).toBe(true);
    expect(Number.isInteger(dust?.penalty)).toBe(true);
  });
});
