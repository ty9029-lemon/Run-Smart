import { useEffect, useState } from 'react';

/** 시계 갱신 주기(ms) */
const CLOCK_TICK_MS = 30 * 1000;

/** 현재 시각을 주기적으로 갱신해 돌려준다. */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), CLOCK_TICK_MS);
    return () => clearInterval(timer);
  }, []);
  return now;
}
