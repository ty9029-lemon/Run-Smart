import {
  DARK_CLASS,
  THEME_COLOR_META,
  THEME_MODES,
  type ResolvedTheme,
  type ThemeMode,
} from '../constants/theme';

/** 저장소에서 읽은 값이 올바른 테마 모드인지 확인한다. */
export function isThemeMode(value: unknown): value is ThemeMode {
  return Object.values<unknown>(THEME_MODES).includes(value);
}

/** 사용자가 고른 모드와 기기 설정으로 실제 적용할 테마를 정한다. */
export function resolveTheme(mode: ThemeMode, systemPrefersDark: boolean): ResolvedTheme {
  if (mode === THEME_MODES.system) {
    return systemPrefersDark ? THEME_MODES.dark : THEME_MODES.light;
  }
  return mode;
}

/** <html>의 dark 클래스와 meta theme-color를 테마에 맞춰 바꾼다. */
export function applyResolvedTheme(theme: ResolvedTheme): void {
  document.documentElement.classList.toggle(DARK_CLASS, theme === THEME_MODES.dark);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLOR_META[theme]);
}
