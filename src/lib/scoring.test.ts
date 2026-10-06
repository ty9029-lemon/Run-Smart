import { describe, expect, it } from 'vitest';
import { SCORE_WEIGHTS } from '../constants/scoring';
import { SCORE_MAX } from '../constants/thresholds';
import { DUMMY_CURRENT_WEATHER, DUMMY_HOURLY } from '../data/dummyWeather';
import type { HourlyWeather, Weather } from '../types';
import { findBestHour, scoreHours } from './bestHour';
import { calcPersonalFeelsLike } from './feelsLike';
import { calcRunScore, calcScoreBreakdown, scoreToLevel } from './runScore';

/** 러닝 기준 모든 항목이 이상적인 낮 날씨 (체감 11°C) */
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

/** 6~19시만 낮이고 나머지 날씨는 이상적인 24시간 */
const FIRST_DAY_HOUR = 6;
const LAST_DAY_HOUR = 19;
const IDEAL_DAY_AND_NIGHT: HourlyWeather[] = Array.from({ length: 24 }, (_, hour) => ({
  ...IDEAL,
  hour,
  isDay: hour >= FIRST_DAY_HOUR && hour <= LAST_DAY_HOUR,
}));

describe('calcPersonalFeelsLike', () => {
  it('보정값이 음수면 더 춥게 느낀다', () => {
    const base = calcPersonalFeelsLike(DUMMY_CURRENT_WEATHER, 0);
    expect(calcPersonalFeelsLike(DUMMY_CURRENT_WEATHER, -2)).toBe(base - 2);
  });
});

describe('점수 배점', () => {
  it('항목별 배점의 합이 100점이다', () => {
    const total = Object.values(SCORE_WEIGHTS).reduce((sum, w) => sum + w, 0);
    expect(total).toBe(SCORE_MAX);
  });

  it('모든 조건이 이상적이면 정확히 100점이다', () => {
    expect(calcRunScore(IDEAL, 0, [], 'running')).toBe(100);
  });

  it('총점은 항목별 점수의 합을 반올림한 값이다', () => {
    const weather = { ...IDEAL, windSpeed: 7, pm10: 60 };
    const parts = Object.values(calcScoreBreakdown(weather, 0, [], 'running'));
    const sum = parts.reduce((a, b) => a + b, 0);
    expect(calcRunScore(weather, 0, [], 'running')).toBe(Math.round(sum));
  });
});

describe('calcRunScore', () => {
  it('극단적인 날씨에서도 0~100 범위를 벗어나지 않는다', () => {
    const extreme = {
      ...IDEAL,
      temp: -20,
      precipitation: 30,
      windSpeed: 30,
      pm10: 500,
      uvIndex: 15,
      humidity: 100,
      isDay: false,
    };
    const score = calcRunScore(extreme, 0, ['dustSensitive', 'uvSensitive'], 'running');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('밤이면 낮보다 낮 항목 배점만큼 낮다', () => {
    const night = { ...IDEAL, isDay: false };
    expect(calcRunScore(night, 0, [], 'running')).toBe(100 - SCORE_WEIGHTS.daylight);
  });

  it.each([
    ['강수', { precipitation: 1 }],
    ['풍속', { windSpeed: 8 }],
    ['습도', { humidity: 85 }],
    ['미세먼지', { pm10: 100 }],
    ['자외선', { uvIndex: 9 }],
    ['기온', { temp: 33 }],
  ])('%s이 나빠지면 점수가 낮아진다', (_name, worse) => {
    const base = calcRunScore(IDEAL, 0, [], 'running');
    expect(calcRunScore({ ...IDEAL, ...worse }, 0, [], 'running')).toBeLessThan(base);
  });

  it('항목이 나쁠수록 점수가 단조 감소한다 (풍속)', () => {
    const scores = [2, 4, 6, 8, 10, 12].map((windSpeed) =>
      calcRunScore({ ...IDEAL, windSpeed }, 0, [], 'running'),
    );
    for (let i = 1; i < scores.length; i += 1) {
      expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
    }
  });

  it('같은 날씨라도 활동마다 적정 체감온도가 달라 점수가 다르다', () => {
    const running = calcRunScore(IDEAL, 0, [], 'running');
    const walking = calcRunScore(IDEAL, 0, [], 'walking');
    const outing = calcRunScore(IDEAL, 0, [], 'outing');
    expect(running).toBeGreaterThan(walking);
    expect(walking).toBeGreaterThan(outing);
  });

  it('체감 보정값이 활동 적정 구간을 벗어나게 하면 점수가 낮아진다', () => {
    expect(calcRunScore(IDEAL, -5, [], 'running')).toBeLessThan(
      calcRunScore(IDEAL, 0, [], 'running'),
    );
  });

  it('미세먼지 민감 제약이 있으면 미세먼지 항목 점수가 더 낮다', () => {
    const dusty = { ...IDEAL, pm10: 80 };
    const plain = calcScoreBreakdown(dusty, 0, [], 'running').dust;
    const sensitive = calcScoreBreakdown(dusty, 0, ['dustSensitive'], 'running').dust;
    expect(sensitive).toBeLessThan(plain);
    expect(calcScoreBreakdown(dusty, 0, ['asthma'], 'running').dust).toBe(sensitive);
  });

  it('자외선 민감 제약이 있으면 자외선 항목 점수가 더 낮다', () => {
    const sunny = { ...IDEAL, uvIndex: 8 };
    expect(calcScoreBreakdown(sunny, 0, ['uvSensitive'], 'running').uv).toBeLessThan(
      calcScoreBreakdown(sunny, 0, [], 'running').uv,
    );
  });

  it('점수를 경고 단계로 변환한다', () => {
    expect(scoreToLevel(90)).toBe('good');
    expect(scoreToLevel(50)).toBe('caution');
    expect(scoreToLevel(10)).toBe('careful');
  });
});

describe('findBestHour', () => {
  it('24시간 중 최고 점수 시간을 고른다', () => {
    const scores = scoreHours(DUMMY_HOURLY, 0, [], 'running');
    const best = findBestHour(scores);
    expect(best?.score).toBe(Math.max(...scores.map((s) => s.score)));
  });

  it('날씨가 같으면 밤 시간은 추천하지 않고 낮 시간 중 가장 이른 시간을 고른다', () => {
    const scores = scoreHours(IDEAL_DAY_AND_NIGHT, 0, [], 'running');
    expect(findBestHour(scores)?.hour).toBe(FIRST_DAY_HOUR);
  });

  it('빈 목록이면 null', () => {
    expect(findBestHour([])).toBeNull();
  });

  it('시작 시각 이후에서만 고른다 (지난 시간대는 추천하지 않는다)', () => {
    const scores = [
      { hour: 0, score: 100 },
      { hour: 15, score: 60 },
      { hour: 18, score: 80 },
      { hour: 22, score: 70 },
    ];
    expect(findBestHour(scores, 16)).toEqual({ hour: 18, score: 80 });
    expect(findBestHour(scores)).toEqual({ hour: 0, score: 100 });
  });

  it('현재 시각 자체도 후보에 포함한다', () => {
    const scores = [
      { hour: 14, score: 90 },
      { hour: 15, score: 80 },
    ];
    expect(findBestHour(scores, 14)?.hour).toBe(14);
  });

  it('점수가 같으면 더 이른 시간을 고른다', () => {
    const scores = [
      { hour: 17, score: 90 },
      { hour: 19, score: 90 },
    ];
    expect(findBestHour(scores, 16)?.hour).toBe(17);
  });

  it('남은 시간대가 없으면 null', () => {
    expect(findBestHour([{ hour: 3, score: 90 }], 4)).toBeNull();
  });
});
