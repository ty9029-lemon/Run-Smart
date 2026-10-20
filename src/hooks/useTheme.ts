import { useEffect } from 'react';
import { DARK_MEDIA_QUERY, THEME_MODES } from '../constants/theme';
import { applyResolvedTheme, resolveTheme } from '../lib/theme';
import { selectAppliedMode, useThemeStore } from '../store/themeStore';

/**
 * 적용할 테마 모드(저장값, 저장 전 미리보기가 있으면 그 값)를 <html>에 반영한다. 앱 최상단에서 한 번만 호출한다.
 * 시스템 모드일 때는 기기의 라이트/다크 설정이 바뀌면 바로 따라간다.
 */
export function useTheme(): void {
  const mode = useThemeStore(selectAppliedMode);

  useEffect(() => {
    const query = window.matchMedia(DARK_MEDIA_QUERY);
    const sync = () => applyResolvedTheme(resolveTheme(mode, query.matches));
    sync();

    if (mode !== THEME_MODES.system) return undefined;
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, [mode]);
}
