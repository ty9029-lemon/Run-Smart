import { describe, expect, it } from 'vitest';
import { THEME_MODES } from '../constants/theme';
import { isThemeMode, resolveTheme } from './theme';

describe('isThemeMode', () => {
  it('정의된 모드만 통과시킨다', () => {
    expect(isThemeMode('system')).toBe(true);
    expect(isThemeMode('light')).toBe(true);
    expect(isThemeMode('dark')).toBe(true);
  });

  it('알 수 없는 값은 거른다', () => {
    expect(isThemeMode('sepia')).toBe(false);
    expect(isThemeMode(undefined)).toBe(false);
    expect(isThemeMode(null)).toBe(false);
  });
});

describe('resolveTheme', () => {
  it('시스템 모드는 기기 설정을 따른다', () => {
    expect(resolveTheme(THEME_MODES.system, true)).toBe('dark');
    expect(resolveTheme(THEME_MODES.system, false)).toBe('light');
  });

  it('직접 고른 모드는 기기 설정과 무관하게 유지한다', () => {
    expect(resolveTheme(THEME_MODES.light, true)).toBe('light');
    expect(resolveTheme(THEME_MODES.dark, false)).toBe('dark');
  });
});
