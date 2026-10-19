import { describe, expect, it } from 'vitest';
import { formatDayPrefix, formatHourLabel } from './formatTime';

/** 테스트 기준 시각: 2026-10-17 오전 8시 */
const NOW = new Date(2026, 9, 17, 8, 0);

describe('formatDayPrefix', () => {
  it('같은 날이면 말머리를 붙이지 않는다', () => {
    expect(formatDayPrefix(new Date(2026, 9, 17, 0, 5).toISOString(), NOW)).toBe('');
    expect(formatDayPrefix(new Date(2026, 9, 17, 7, 34).toISOString(), NOW)).toBe('');
  });

  it('전날이면 어제 (24시간이 안 지나도 자정을 넘겼으면 어제)', () => {
    expect(formatDayPrefix(new Date(2026, 9, 16, 23, 50).toISOString(), NOW)).toBe('어제');
    expect(formatDayPrefix(new Date(2026, 9, 16, 19, 0).toISOString(), NOW)).toBe('어제');
  });

  it('그보다 전이면 월/일', () => {
    expect(formatDayPrefix(new Date(2026, 9, 14, 19, 0).toISOString(), NOW)).toBe('10월 14일');
  });
});

describe('formatHourLabel', () => {
  it('오전·오후 12시간제로 바꾼다', () => {
    expect(formatHourLabel(0)).toBe('오전 12시');
    expect(formatHourLabel(7)).toBe('오전 7시');
    expect(formatHourLabel(12)).toBe('오후 12시');
    expect(formatHourLabel(19)).toBe('오후 7시');
    expect(formatHourLabel(23)).toBe('오후 11시');
  });
});
