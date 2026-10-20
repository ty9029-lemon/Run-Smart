import { useEffect, useState } from 'react';
import { hasIntroPlayed, markIntroPlayed } from '../lib/introPlayed';
import { useAppRevealed } from './useAppRevealed';

interface IntroOnceState {
  /** 스플래시가 사라지기 전이라 화면을 숨겨야 하는지 */
  isHidden: boolean;
  /** 지금 등장 모션을 걸어야 하는지 (첫 진입이고 스플래시가 사라진 뒤) */
  shouldAnimate: boolean;
}

/**
 * 화면을 처음 열 때만 한 번 등장 모션을 보여주게 한다. 탭을 오가며 다시 열면 모션 없이 바로 보인다.
 * 첫 방문에서는 스플래시가 완전히 사라진 뒤에 시작한다.
 * @param key 화면을 구분하는 키
 */
export function useIntroOnce(key: string): IntroOnceState {
  const isRevealed = useAppRevealed();
  const [isFirstVisit] = useState(() => !hasIntroPlayed(key));
  const shouldAnimate = isFirstVisit && isRevealed;
  useEffect(() => {
    if (shouldAnimate) markIntroPlayed(key);
  }, [key, shouldAnimate]);
  return { isHidden: !isRevealed, shouldAnimate };
}
