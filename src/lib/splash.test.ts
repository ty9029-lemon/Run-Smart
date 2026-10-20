import { describe, expect, it, vi } from 'vitest';
import { clearBootBackground, markSplashShown, shouldShowSplash } from './splash';

/** 테스트용 메모리 저장소 */
function createStorage(): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
  } as Storage;
}

describe('스플래시 표시 여부', () => {
  it('처음에는 보여준다', () => {
    expect(shouldShowSplash(createStorage())).toBe(true);
  });

  it('한 번 보여준 뒤에는 보여주지 않는다', () => {
    const storage = createStorage();
    markSplashShown(storage);
    expect(shouldShowSplash(storage)).toBe(false);
  });

  it('저장소를 쓸 수 없으면 보여주고, 기록 실패도 오류를 내지 않는다', () => {
    expect(shouldShowSplash(null)).toBe(true);
    expect(() => markSplashShown(null)).not.toThrow();
  });
});

describe('미리 칠한 바탕색 지우기', () => {
  it('인라인 배경색만 지운다', () => {
    const removed: string[] = [];
    const root = { style: { removeProperty: (name: string) => removed.push(name) } };
    clearBootBackground(root as unknown as HTMLElement);
    expect(removed).toEqual(['background-color']);
  });
});

describe('스플래시 사라짐 알림', () => {
  it('걷히기 전에는 false, 알린 뒤에는 true이고 구독자에게 알린다', async () => {
    vi.resetModules();
    const { getAppRevealed, revealApp, subscribeAppReveal } = await import('./splash');
    const listener = vi.fn();
    subscribeAppReveal(listener);
    expect(getAppRevealed()).toBe(false);
    revealApp();
    revealApp();
    expect(getAppRevealed()).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
