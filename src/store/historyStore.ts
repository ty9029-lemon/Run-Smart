import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HISTORY_DAYS, MS_PER_DAY } from '../constants/thresholds';
import type { Feedback, HistoryEntry } from '../types';

interface HistoryState {
  entries: HistoryEntry[];
  addEntry: (entry: HistoryEntry) => void;
  /** 기록을 삭제한다 (결정 취소) */
  removeEntry: (id: string) => void;
  /** 기록에 체감 피드백을 남긴다 */
  setFeedback: (id: string, feedback: Feedback) => void;
  /** 활동을 마친 기록에 활동 시간(초)을 남긴다 */
  setDuration: (id: string, durationSec: number) => void;
}

/** 저장 데이터 버전 (1: '외출' 활동 제거, 2: 안 가기(skip) 기록 제거, 3: 더미 시드 기록 제거) */
const HISTORY_STORE_VERSION = 3;

/** 예전 더미 시드 기록의 id 접두어 */
const SEED_ID_PREFIX = 'seed-';

/** 제거된 활동 id */
const REMOVED_ACTIVITY = 'outing';

/** 제거된 결정 값 (안 가기 기능 폐지) */
const REMOVED_DECISION = 'skip';

/**
 * 이전 버전에서 저장된 기록 중 더 이상 쓰지 않는 항목('외출' 활동, 안 가기 기록)을 버린다.
 * @param entries 저장돼 있던 기록
 */
export function dropRemovedEntries(entries: HistoryEntry[]): HistoryEntry[] {
  return entries.filter(
    (e) =>
      (e.activity as string) !== REMOVED_ACTIVITY && (e.decision as string) !== REMOVED_DECISION,
  );
}

/**
 * 예전에 모든 사용자에게 채워 주던 더미 시드 기록을 버린다.
 * @param entries 저장돼 있던 기록
 */
export function dropSeedEntries(entries: HistoryEntry[]): HistoryEntry[] {
  return entries.filter((e) => !e.id.startsWith(SEED_ID_PREFIX));
}

/** 보관 기간(HISTORY_DAYS) 이내 기록만 남기고 최신순 정렬 */
function keepRecent(entries: HistoryEntry[], now: number): HistoryEntry[] {
  const limit = now - HISTORY_DAYS * MS_PER_DAY;
  return entries
    .filter((e) => new Date(e.date).getTime() >= limit)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** 활동 히스토리 스토어 (localStorage 저장, 최초엔 빈 기록으로 시작) */
export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      entries: [],
      // 같은 날 같은 활동도 출발할 때마다 각각 기록한다 (같은 id만 교체)
      addEntry: (entry) =>
        set((state) => {
          const others = state.entries.filter((e) => e.id !== entry.id);
          return { entries: keepRecent([entry, ...others], Date.now()) };
        }),
      removeEntry: (id) =>
        set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
      setFeedback: (id, feedback) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, feedback, feedbackAt: new Date().toISOString() } : e,
          ),
        })),
      setDuration: (id, durationSec) =>
        set((state) => ({
          entries: state.entries.map((e) => (e.id === id ? { ...e, durationSec } : e)),
        })),
    }),
    {
      name: 'run-smart-history',
      version: HISTORY_STORE_VERSION,
      // 제거된 '외출' 활동, 안 가기(skip) 기록, 더미 시드 기록은 버린다
      migrate: (persisted, version) => {
        const state = persisted as HistoryState;
        if (version >= HISTORY_STORE_VERSION) return state;
        return { ...state, entries: dropSeedEntries(dropRemovedEntries(state.entries)) };
      },
    },
  ),
);
