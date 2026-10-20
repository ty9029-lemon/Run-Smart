import { beforeEach, describe, expect, it } from 'vitest';
import { THEME_MODES } from '../constants/theme';
import { selectAppliedMode, useThemeStore } from './themeStore';

describe('themeStore 미리보기', () => {
  beforeEach(() => {
    useThemeStore.setState({ mode: THEME_MODES.dark, previewMode: null });
  });

  it('미리보기가 없으면 저장된 모드를 적용한다', () => {
    expect(selectAppliedMode(useThemeStore.getState())).toBe(THEME_MODES.dark);
  });

  it('미리보기를 고르면 저장값은 두고 적용 모드만 바뀐다', () => {
    useThemeStore.getState().setPreviewMode(THEME_MODES.light);
    const state = useThemeStore.getState();
    expect(selectAppliedMode(state)).toBe(THEME_MODES.light);
    expect(state.mode).toBe(THEME_MODES.dark);
  });

  it('저장하면 미리보기가 저장값으로 확정된다', () => {
    useThemeStore.getState().setPreviewMode(THEME_MODES.light);
    useThemeStore.getState().commitPreview();
    const state = useThemeStore.getState();
    expect(state.mode).toBe(THEME_MODES.light);
    expect(state.previewMode).toBeNull();
  });

  it('미리보기가 없을 때 확정해도 저장값이 바뀌지 않는다', () => {
    useThemeStore.getState().commitPreview();
    expect(useThemeStore.getState().mode).toBe(THEME_MODES.dark);
  });

  it('저장 없이 버리면 원래 모드로 돌아간다', () => {
    useThemeStore.getState().setPreviewMode(THEME_MODES.light);
    useThemeStore.getState().clearPreview();
    expect(selectAppliedMode(useThemeStore.getState())).toBe(THEME_MODES.dark);
  });
});
