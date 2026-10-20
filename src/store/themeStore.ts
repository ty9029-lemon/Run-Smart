import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_THEME_MODE, THEME_STORAGE_KEY, type ThemeMode } from '../constants/theme';
import { isThemeMode } from '../lib/theme';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

/**
 * 테마 모드 스토어 (localStorage 저장).
 * 프로필과 분리해 프로필 마이그레이션·클라우드 동기화에 영향을 주지 않는다.
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: DEFAULT_THEME_MODE,
      setMode: (mode) => set({ mode }),
    }),
    {
      name: THEME_STORAGE_KEY,
      partialize: (state) => ({ mode: state.mode }),
      // 저장값이 깨졌거나 알 수 없는 모드면 기본값으로 되돌린다
      merge: (persisted, current) => {
        const saved = (persisted as { mode?: unknown } | undefined)?.mode;
        return { ...current, mode: isThemeMode(saved) ? saved : current.mode };
      },
    },
  ),
);
