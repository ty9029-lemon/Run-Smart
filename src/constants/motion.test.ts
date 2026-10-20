import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MOTION_DURATION_MS } from './motion';
import { SPLASH_FADE_MS } from './splash';

const css = readFileSync('src/index.css', 'utf8');

/** index.css :root에서 모션 토큰 값을 읽는다. */
function readToken(name: string): string | undefined {
  return css.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim();
}

describe('모션 duration 토큰', () => {
  it.each(Object.entries(MOTION_DURATION_MS))('%s는 CSS 토큰과 같은 값이다', (key, ms) => {
    expect(readToken(`motion-duration-${key}`)).toBe(`${ms}ms`);
  });

  it('스플래시 페이드는 normal과 같다', () => {
    expect(SPLASH_FADE_MS).toBe(MOTION_DURATION_MS.normal);
  });
});

describe('모션 easing·간격 토큰', () => {
  it('easing, stagger, 이동 거리 토큰이 정의돼 있다', () => {
    expect(readToken('motion-ease-main')).toBe('cubic-bezier(0, 0, 0, 1)');
    expect(readToken('motion-ease-exit')).toBe('cubic-bezier(0.3, 0, 1, 1)');
    expect(readToken('motion-stagger')).toMatch(/^60ms/);
    expect(readToken('motion-distance-sm')).toMatch(/^8px/);
    expect(readToken('motion-distance-md')).toMatch(/^24px/);
  });
});
