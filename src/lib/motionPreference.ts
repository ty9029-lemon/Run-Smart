/** 시스템의 "동작 줄이기" 설정을 확인하는 미디어 쿼리 */
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** 사용자가 시스템에서 동작 줄이기를 켰는지. CSS가 아닌 JS 타이머·애니메이션에서 판단할 때 쓴다. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * index.css :root의 모션 변수 값을 읽는다. JS 애니메이션이 CSS와 같은 이징을 쓰게 하려는 것이다.
 * 읽지 못하면(값이 없거나 DOM이 없으면) 기본값을 돌려준다.
 * @param name 변수 이름 (예: '--motion-ease-main')
 * @param fallback 읽지 못했을 때 쓸 값
 */
export function readMotionToken(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}
