import { useCallback, useEffect, useRef } from 'react';

/**
 * 컴포넌트가 화면에 마운트된 뒤 경과한 시간(ms)을 읽는 함수를 돌려준다.
 * 시작 시점이 기록되기 전에는 null을 돌려준다.
 */
export function useElapsedSinceMount(): () => number | null {
  const mountedAtRef = useRef<number | null>(null);

  useEffect(() => {
    mountedAtRef.current = performance.now();
  }, []);

  return useCallback(() => {
    const mountedAt = mountedAtRef.current;
    return mountedAt === null ? null : performance.now() - mountedAt;
  }, []);
}
