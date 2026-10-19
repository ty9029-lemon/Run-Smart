import { useCallback, useEffect, useRef, useState } from 'react';

interface ScrollingState {
  /** 지금 스크롤 중이면 true */
  isScrolling: boolean;
  /** 스크롤 가능한 요소의 onScroll에 연결한다 */
  onScroll: () => void;
}

/**
 * 스크롤하는 동안만 true인 상태를 돌려준다. 마지막 스크롤 이벤트 후 idleMs가 지나면 false로 되돌린다.
 * @param idleMs 스크롤이 멈췄다고 보는 대기 시간(ms)
 */
export function useIsScrolling(idleMs: number): ScrollingState {
  const [isScrolling, setIsScrolling] = useState(false);
  const timerRef = useRef<number>();

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  /** 스크롤 이벤트마다 상태를 켜고 멈춤 타이머를 다시 시작한다. */
  const onScroll = useCallback(() => {
    setIsScrolling(true);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setIsScrolling(false), idleMs);
  }, [idleMs]);

  return { isScrolling, onScroll };
}
