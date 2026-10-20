import { describe, expect, it } from 'vitest';
import { calcPaceSecPerKm, formatPace } from './pace';

describe('calcPaceSecPerKm', () => {
  it('시간을 거리로 나눈 초/km를 돌려준다', () => {
    expect(calcPaceSecPerKm(5, 1500)).toBe(300);
  });

  it('거리나 시간이 없으면 null이다', () => {
    expect(calcPaceSecPerKm(undefined, 1500)).toBeNull();
    expect(calcPaceSecPerKm(5, undefined)).toBeNull();
  });

  it('0 이하면 null이다', () => {
    expect(calcPaceSecPerKm(0, 1500)).toBeNull();
    expect(calcPaceSecPerKm(5, 0)).toBeNull();
  });
});

describe('formatPace', () => {
  it('분′초″로 바꾼다', () => {
    expect(formatPace(409)).toBe('6′49″');
  });

  it('초를 두 자리로 맞춘다', () => {
    expect(formatPace(305)).toBe('5′05″');
  });

  it('반올림으로 60초가 되면 분을 올린다', () => {
    expect(formatPace(359.6)).toBe('6′00″');
  });
});
