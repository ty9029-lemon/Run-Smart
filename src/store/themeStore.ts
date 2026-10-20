import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_THEME_MODE, THEME_STORAGE_KEY, type ThemeMode } from '../constants/theme';
import { isThemeMode } from '../lib/theme';

interface ThemeState {
  /** 저장된 테마 모드 */
  mode: ThemeMode;
  /** 설정 화면에서 고르고 아직 저장하지 않은 미리보기 모드 (저장소에는 넣지 않는다) */
  previewMode: ThemeMode | null;
  setMode: (mode: ThemeMode) => void;
  setPreviewMode: (mode: ThemeMode) => void;
  /** 미리보기를 저장된 모드로 확정한다 */
  commitPreview: () => void;
  /** 미리보기를 버리고 저장된 모드로 되돌린다 */
  clearPreview: () => void;
}

/**
 * 화면에 실제로 적용할 테마 모드를 고른다. 미리보기가 있으면 그 값이 우선한다.
 * @param state 테마 스토어 상태
 */
export const selectAppliedMode = (state: Pick<ThemeState, 'mode' | 'previewMode'>): ThemeMode =>
  state.previewMode ?? state.mode;

/**
 * 테마 모드 스토어 (localStorage 저장).
 * 설정 화면에서 고른 값은 미리보기로 먼저 적용하고, [저장]을 눌러야 저장된다.
 * 프로필과 분리해 프로필 마이그레이션·클라우드 동기화에 영향을 주지 않는다.
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: DEFAULT_THEME_MODE,
      previewMode: null,
      setMode: (mode) => set({ mode }),
      setPreviewMode: (previewMode) => set({ previewMode }),
      commitPreview: () => set((s) => ({ mode: s.previewMode ?? s.mode, previewMode: null })),
      clearPreview: () => set({ previewMode: null }),
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
