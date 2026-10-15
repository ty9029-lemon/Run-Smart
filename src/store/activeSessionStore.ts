import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Activity } from '../types';

/** 진행 중인 활동 세션 */
export interface ActiveSession {
  /** 이 세션이 속한 히스토리 기록 id */
  entryId: string;
  activity: Activity;
  /** 시작 시각(ms) */
  startedAt: number;
}

interface ActiveSessionState {
  session: ActiveSession | null;
  /** 활동을 시작한다 */
  start: (session: ActiveSession) => void;
  /** 진행 중인 활동을 비운다 (종료·취소 공용) */
  clear: () => void;
}

/**
 * 진행 중인 활동(타이머) 스토어. localStorage에 저장해 탭 이동·새로고침 뒤에도 이어 간다.
 * 기록(historyStore)과 분리해 두어 클라우드 동기화가 기록을 덮어써도 영향받지 않는다.
 */
export const useActiveSessionStore = create<ActiveSessionState>()(
  persist(
    (set) => ({
      session: null,
      start: (session) => set({ session }),
      clear: () => set({ session: null }),
    }),
    { name: 'run-smart-active-session', version: 1 },
  ),
);
