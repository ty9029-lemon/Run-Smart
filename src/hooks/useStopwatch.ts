import { useEffect, useState } from 'react';
import { STOPWATCH_TICK_MS } from '../constants/thresholds';

/**
 * 시작 시각부터 지난 시간(ms)을 1초마다 갱신해 돌려준다.
 * 항상 현재 시각과의 차이로 계산하므로 탭을 옮기거나 새로고침해도 정확하다.
 * @param startedAt 시작 시각(ms). null이면 멈춘 상태로 0을 돌려준다
 */
export function useStopwatch(startedAt: number | null): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (startedAt === null) return undefined;
    const timer = setInterval(() => setNow(Date.now()), STOPWATCH_TICK_MS);
    return () => clearInterval(timer);
  }, [startedAt]);

  return startedAt === null ? 0 : Math.max(0, now - startedAt);
}
