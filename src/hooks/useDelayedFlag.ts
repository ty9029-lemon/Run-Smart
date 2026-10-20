import { useEffect, useState } from 'react';

/**
 * 값이 true가 된 뒤 일정 시간이 지나야 true를 돌려준다. false가 되면 바로 false다.
 * 로딩이 짧을 때 스켈레톤이 깜빡이지 않도록, 오래 걸릴 때만 보여주는 데 쓴다.
 * @param flag 지연시킬 값
 * @param delayMs true가 된 뒤 기다릴 시간(ms)
 */
export function useDelayedFlag(flag: boolean, delayMs: number): boolean {
  const [isElapsed, setIsElapsed] = useState(false);
  useEffect(() => {
    if (!flag) return;
    const timer = setTimeout(() => setIsElapsed(true), delayMs);
    return () => {
      clearTimeout(timer);
      setIsElapsed(false);
    };
  }, [flag, delayMs]);
  return flag && isElapsed;
}
