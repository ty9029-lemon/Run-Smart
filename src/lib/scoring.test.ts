import { describe, expect, it } from 'vitest';
import { DUMMY_CURRENT_WEATHER, DUMMY_HOURLY } from '../data/dummyWeather';
import { findBestHour, scoreHours } from './bestHour';
import { calcPersonalFeelsLike } from './feelsLike';
import { calcRunScore, scoreToLevel } from './runScore';

describe('calcPersonalFeelsLike', () => {
  it('보정값이 음수면 더 춥게 느낀다', () => {
    const base = calcPersonalFeelsLike(DUMMY_CURRENT_WEATHER, 0);
    expect(calcPersonalFeelsLike(DUMMY_CURRENT_WEATHER, -2)).toBe(base - 2);
  });
});

describe('calcRunScore', () => {
  it('0~100 범위를 벗어나지 않는다', () => {
    const extreme = { ...DUMMY_CURRENT_WEATHER, temp: -20, precipitation: 30 };
    const score = calcRunScore(extreme, 0, []);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('미세먼지 민감 제약이 있으면 점수가 더 낮다', () => {
    const dusty = { ...DUMMY_CURRENT_WEATHER, pm10: 120 };
    expect(calcRunScore(dusty, 0, ['dustSensitive'])).toBeLessThan(
      calcRunScore(dusty, 0, []),
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
    const scores = scoreHours(DUMMY_HOURLY, 0, []);
    const best = findBestHour(scores);
    expect(best?.score).toBe(Math.max(...scores.map((s) => s.score)));
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
