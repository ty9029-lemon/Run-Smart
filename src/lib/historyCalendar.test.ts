import { describe, expect, it } from 'vitest';
import { buildDummyGuide } from '../data/dummyGuide';
import { DUMMY_CURRENT_WEATHER } from '../data/dummyWeather';
import type { HistoryEntry } from '../types';
import {
  buildMonthGrid,
  dayKey,
  groupEntriesByDay,
  isMonthInRange,
  shiftMonth,
} from './historyCalendar';
import { NEUTRAL_SENSITIVITY } from './feelsLike';

const NOW = new Date(2026, 9, 8, 12, 0, 0);

/** 지정한 날짜에 기록된 항목 */
function entryOn(id: string, date: Date, patch: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    id,
    date: date.toISOString(),
    activity: 'running',
    decision: 'go',
    weatherSummary: '',
    guide: buildDummyGuide('running', DUMMY_CURRENT_WEATHER, NEUTRAL_SENSITIVITY, []),
    ...patch,
  };
}

describe('buildMonthGrid', () => {
  it('첫 요일만큼 앞쪽을 빈칸으로 채운다', () => {
    // 2026년 10월 1일은 목요일
    const [firstWeek] = buildMonthGrid(2026, 9);
    expect(firstWeek.slice(0, 4)).toEqual([null, null, null, null]);
    expect(firstWeek[4]?.getDate()).toBe(1);
  });

  it('모든 주가 7칸이고 날짜 수가 달 일수와 같다', () => {
    const grid = buildMonthGrid(2026, 9);
    expect(grid.every((week) => week.length === 7)).toBe(true);
    expect(grid.flat().filter(Boolean)).toHaveLength(31);
  });

  it('윤년 2월은 29일까지 있다', () => {
    expect(buildMonthGrid(2028, 1).flat().filter(Boolean)).toHaveLength(29);
    expect(buildMonthGrid(2026, 1).flat().filter(Boolean)).toHaveLength(28);
  });

  it('일요일로 시작하는 달은 앞쪽 빈칸이 없다', () => {
    // 2026년 2월 1일은 일요일
    expect(buildMonthGrid(2026, 1)[0][0]?.getDate()).toBe(1);
  });
});

describe('shiftMonth', () => {
  it('연도 경계를 넘어 이동한다', () => {
    expect(shiftMonth({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 });
    expect(shiftMonth({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 });
  });
});

describe('groupEntriesByDay', () => {
  it('같은 날 기록을 한데 묶는다', () => {
    const a = entryOn('a', new Date(2026, 9, 7, 8));
    const b = entryOn('b', new Date(2026, 9, 7, 19), { activity: 'hiking' });
    const c = entryOn('c', new Date(2026, 9, 6, 8));
    const grouped = groupEntriesByDay([a, b, c]);
    expect(grouped.get(dayKey(new Date(2026, 9, 7)))).toEqual([a, b]);
    expect(grouped.get(dayKey(new Date(2026, 9, 6)))).toEqual([c]);
  });

  it('기록 없는 날은 키가 없다', () => {
    expect(groupEntriesByDay([]).get(dayKey(NOW))).toBeUndefined();
  });
});

describe('isMonthInRange', () => {
  it('이번 달은 범위 안이다', () => {
    expect(isMonthInRange({ year: 2026, month: 9 }, NOW)).toBe(true);
  });

  it('다음 달은 범위 밖이다', () => {
    expect(isMonthInRange({ year: 2026, month: 10 }, NOW)).toBe(false);
  });

  it('보관 기간이 속한 가장 오래된 달까지는 범위 안이다', () => {
    expect(isMonthInRange({ year: 2025, month: 9 }, NOW)).toBe(true);
    expect(isMonthInRange({ year: 2025, month: 8 }, NOW)).toBe(false);
  });
});
