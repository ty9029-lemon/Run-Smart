import { afterEach, describe, expect, it, vi } from 'vitest';
import { prefersReducedMotion, readMotionToken } from './motionPreference';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('prefersReducedMotion', () => {
  it('브라우저가 아닌 환경에서는 false다', () => {
    expect(prefersReducedMotion()).toBe(false);
  });

  it('동작 줄이기를 켰으면 true다', () => {
    const matchMedia = vi.fn(() => ({ matches: true }));
    vi.stubGlobal('window', { matchMedia });
    expect(prefersReducedMotion()).toBe(true);
    expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });

  it('동작 줄이기를 켜지 않았으면 false다', () => {
    vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });
    expect(prefersReducedMotion()).toBe(false);
  });

  it('matchMedia를 지원하지 않으면 false다', () => {
    vi.stubGlobal('window', {});
    expect(prefersReducedMotion()).toBe(false);
  });
});

describe('readMotionToken', () => {
  it('DOM이 없으면 기본값을 돌려준다', () => {
    expect(readMotionToken('--motion-ease-main', 'ease-out')).toBe('ease-out');
  });

  it('CSS 변수 값을 읽어 공백을 정리해 돌려준다', () => {
    vi.stubGlobal('document', { documentElement: {} });
    vi.stubGlobal('getComputedStyle', () => ({ getPropertyValue: () => ' cubic-bezier(0, 0, 0, 1) ' }));
    expect(readMotionToken('--motion-ease-main', 'ease-out')).toBe('cubic-bezier(0, 0, 0, 1)');
  });

  it('값이 비어 있으면 기본값을 돌려준다', () => {
    vi.stubGlobal('document', { documentElement: {} });
    vi.stubGlobal('getComputedStyle', () => ({ getPropertyValue: () => '' }));
    expect(readMotionToken('--motion-ease-main', 'ease-out')).toBe('ease-out');
  });
});
