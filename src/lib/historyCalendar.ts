import { DAYS_PER_WEEK, HISTORY_DAYS, MS_PER_DAY } from '../constants/thresholds';
import type { HistoryEntry } from '../types';

/** 주 단위로 나눈 달력 칸 (해당 달이 아닌 칸은 null) */
export type MonthGrid = (Date | null)[][];

/** 연·월 (month는 0~11) */
export interface YearMonth {
  year: number;
  month: number;
}

/**
 * 날짜를 하루 단위 키로 바꾼다. (스토어의 같은 날 비교와 같은 기준)
 * @param date 날짜
 */
export function dayKey(date: Date): string {
  return date.toDateString();
}

/**
 * 한 달을 일요일 시작 7열 달력 칸으로 만든다.
 * @param year 연도
 * @param month 월 (0~11)
 */
export function buildMonthGrid(year: number, month: number): MonthGrid {
  const leading = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array<null>(leading).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % DAYS_PER_WEEK !== 0) cells.push(null);
  return Array.from({ length: cells.length / DAYS_PER_WEEK }, (_, week) =>
    cells.slice(week * DAYS_PER_WEEK, (week + 1) * DAYS_PER_WEEK),
  );
}

/**
 * 기록을 날짜별로 묶는다.
 * @param entries 히스토리 기록
 */
export function groupEntriesByDay(entries: HistoryEntry[]): Map<string, HistoryEntry[]> {
  const grouped = new Map<string, HistoryEntry[]>();
  for (const entry of entries) {
    const key = dayKey(new Date(entry.date));
    grouped.set(key, [...(grouped.get(key) ?? []), entry]);
  }
  return grouped;
}

/**
 * 연·월을 delta개월 만큼 옮긴다. (연도 경계 포함)
 * @param current 기준 연·월
 * @param delta 이동할 개월 수 (음수면 과거)
 */
export function shiftMonth(current: YearMonth, delta: number): YearMonth {
  const shifted = new Date(current.year, current.month + delta, 1);
  return { year: shifted.getFullYear(), month: shifted.getMonth() };
}

/** 연·월을 비교 가능한 정수로 바꾼다. */
function monthIndex({ year, month }: YearMonth): number {
  return year * 12 + month;
}

/**
 * 해당 달이 보관 기간 안(가장 오래된 기록 달 ~ 이번 달)에 있는지 확인한다.
 * @param target 확인할 연·월
 * @param now 현재 시각
 */
export function isMonthInRange(target: YearMonth, now: Date): boolean {
  const oldest = new Date(now.getTime() - HISTORY_DAYS * MS_PER_DAY);
  const toYearMonth = (d: Date): YearMonth => ({ year: d.getFullYear(), month: d.getMonth() });
  const index = monthIndex(target);
  return index >= monthIndex(toYearMonth(oldest)) && index <= monthIndex(toYearMonth(now));
}
