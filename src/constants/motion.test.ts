import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MOTION_DURATION_MS, SKELETON_DELAY_MS } from './motion';
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

describe('모션 줄이기 전역 처리', () => {
  const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));

  it('애니메이션과 전환을 즉시 끝낸다', () => {
    expect(reduced).toContain('animation-duration: 0.01ms !important');
    expect(reduced).toContain('transition-duration: 0.01ms !important');
  });

  it('닫힘 애니메이션 이벤트가 오도록 duration을 0으로 두지 않는다', () => {
    expect(reduced).not.toMatch(/animation-duration:\s*0(ms|s)?\s/);
  });
});

describe('순차 등장', () => {
  it('stagger 간격 토큰으로 자식 지연을 계산한다', () => {
    expect(css).toContain('.stagger-children > :nth-child(2)');
    expect(css).toContain('calc(1 * var(--motion-stagger))');
  });
});

describe('스켈레톤·페이드 등장', () => {
  it('스켈레톤은 1400ms 주기로 하이라이트가 지나가는 쉬머다', () => {
    expect(css).toContain('--animate-skeleton: skeleton-shimmer 1400ms linear infinite');
    expect(css).toContain('@keyframes skeleton-shimmer');
    // 제자리 밝기 변화(pulse)는 대비가 5/255라 보이지 않아 쓰지 않는다
    expect(css).not.toContain('skeleton-pulse');
  });

  it('쉬머 하이라이트와 모션 줄이기용 면 색 토큰이 라이트·다크에 모두 정의돼 있다', () => {
    expect(css.match(/--skeleton-highlight:/g)).toHaveLength(2);
    expect(css.match(/--skeleton-glow:/g)).toHaveLength(2);
  });

  it('모션 줄이기에서도 스켈레톤은 움직이지 않는 밝기 변화로 계속 살아 있다', () => {
    const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
    const exception = reduced.slice(reduced.indexOf("[data-slot='skeleton']"));
    expect(exception).toContain('animation-name: skeleton-glow !important');
    expect(exception).toContain('animation-iteration-count: infinite !important');
    expect(exception).toContain('background-image: none !important');
    expect(css).toContain('@keyframes skeleton-glow');
  });

  it('페이드 등장은 자식을 한꺼번에 나타나게 한다', () => {
    expect(css).toContain('.fade-children > *');
    expect(css).not.toMatch(/\.fade-children > :nth-child/);
  });

  it('스켈레톤은 fast 시간 안에 끝나는 로딩에서는 보이지 않는다', () => {
    expect(SKELETON_DELAY_MS).toBe(MOTION_DURATION_MS.fast);
  });
});
