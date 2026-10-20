/** 사용자가 고를 수 있는 테마 모드 (system은 기기 설정을 따른다) */
export const THEME_MODES = {
  system: 'system',
  light: 'light',
  dark: 'dark',
} as const;

export type ThemeMode = (typeof THEME_MODES)[keyof typeof THEME_MODES];

/** 실제로 화면에 적용되는 테마 */
export type ResolvedTheme = typeof THEME_MODES.light | typeof THEME_MODES.dark;

/** 기본 테마 모드: 다크 (설정에서 고른 적이 없는 사용자에게 적용된다) */
export const DEFAULT_THEME_MODE: ThemeMode = THEME_MODES.dark;

/** localStorage 저장 키 (index.html의 깜빡임 방지 스크립트와 값을 맞춘다) */
export const THEME_STORAGE_KEY = 'run-smart-theme';

/** 기기가 다크 모드인지 확인하는 미디어 쿼리 */
export const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

/** 다크 테마일 때 <html>에 붙이는 클래스 (index.css의 .dark와 대응) */
export const DARK_CLASS = 'dark';

/** 브라우저 주소창 색(meta theme-color): 각 테마의 background 값과 맞춘다 */
export const THEME_COLOR_META: Record<ResolvedTheme, string> = {
  light: '#ffffff',
  dark: '#111111',
};

/** 설정 화면의 테마 선택지 */
export const THEME_OPTIONS: ReadonlyArray<{ mode: ThemeMode; label: string }> = [
  { mode: THEME_MODES.system, label: '시스템' },
  { mode: THEME_MODES.light, label: '라이트' },
  { mode: THEME_MODES.dark, label: '다크' },
];
