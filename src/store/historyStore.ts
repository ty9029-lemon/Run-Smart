import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HISTORY_DAYS, MS_PER_DAY } from '../constants/thresholds';
import { createDummyHistory } from '../data/dummyHistory';
import type { HistoryEntry } from '../types';

interface HistoryState {
  entries: HistoryEntry[];
  addEntry: (entry: HistoryEntry) => void;
}

/** 같은 날짜인지 비교 */
function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

/** 최근 7일 이내 기록만 남기고 최신순 정렬 */
function keepRecent(entries: HistoryEntry[], now: number): HistoryEntry[] {
  const limit = now - HISTORY_DAYS * MS_PER_DAY;
  return entries
    .filter((e) => new Date(e.date).getTime() >= limit)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** 활동 히스토리 스토어 (localStorage 저장, 최초엔 더미 데이터로 시작) */
export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      entries: createDummyHistory(Date.now()),
      addEntry: (entry) =>
        set((state) => {
          const others = state.entries.filter(
            (e) => !(isSameDay(e.date, entry.date) && e.activity === entry.activity),
          );
          return { entries: keepRecent([entry, ...others], Date.now()) };
        }),
    }),
    { name: 'run-smart-history' },
  ),
);
