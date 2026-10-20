import { useLayoutEffect, useRef, type RefObject } from 'react';
import { MOTION_DURATION_MS } from '../constants/motion';
import { prefersReducedMotion, readMotionToken } from '../lib/motionPreference';

/** 높이가 바뀌는 구간에 쓰는 이징 변수와, 읽지 못했을 때의 기본값 */
const EASE_TOKEN = '--motion-ease-main';
const EASE_FALLBACK = 'ease-out';

/**
 * 값이 바뀌어 요소의 높이가 달라질 때, 이전 높이에서 새 높이로 부드럽게 옮긴다.
 * 안의 내용이 바뀌는 순간 아래 요소가 한꺼번에 튀는 것을 막는다.
 * 요소는 다시 그려지지 않는 안정적인 래퍼여야 한다(안쪽 내용이 키로 바뀌는 구조).
 * 처음 그릴 때와 동작 줄이기 설정에서는 움직이지 않는다.
 * @param ref 높이를 보간할 래퍼
 * @param trigger 바뀔 때 높이 변화를 확인하는 값
 */
export function useHeightTransition(ref: RefObject<HTMLElement | null>, trigger: unknown) {
  const previousHeight = useRef<number | null>(null);
  const runningAnimation = useRef<Animation | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    // 진행 중인 보간이 있으면 끊어서 새 내용의 원래 높이를 잰다.
    runningAnimation.current?.cancel();
    const nextHeight = element.offsetHeight;
    const prevHeight = previousHeight.current;
    previousHeight.current = nextHeight;
    if (prevHeight === null || prevHeight === nextHeight) return;
    if (prefersReducedMotion() || typeof element.animate !== 'function') return;

    // 줄어드는 동안 넘치는 내용이 아래 요소를 가리지 않게 세로만 잘라낸다. 가로는 슬라이드가 보이도록 둔다.
    element.style.overflowY = 'clip';
    const animation = element.animate(
      [{ height: `${prevHeight}px` }, { height: `${nextHeight}px` }],
      {
        duration: MOTION_DURATION_MS.normal,
        easing: readMotionToken(EASE_TOKEN, EASE_FALLBACK),
      },
    );
    const restore = () => element.style.removeProperty('overflow-y');
    animation.onfinish = restore;
    animation.oncancel = restore;
    runningAnimation.current = animation;
  }, [ref, trigger]);
}
