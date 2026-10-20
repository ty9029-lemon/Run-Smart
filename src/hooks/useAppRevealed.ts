import { useSyncExternalStore } from 'react';
import { getAppRevealed, subscribeAppReveal } from '../lib/splash';

/**
 * 스플래시가 완전히 사라져 화면이 드러났는지 알려준다.
 * 사라지는 로고와 겹쳐 보이지 않도록, 등장 모션은 이 값이 true가 된 뒤에 시작한다.
 */
export function useAppRevealed(): boolean {
  return useSyncExternalStore(subscribeAppReveal, getAppRevealed, () => true);
}
