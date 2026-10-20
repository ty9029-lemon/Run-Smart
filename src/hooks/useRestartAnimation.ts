import { useLayoutEffect, type RefObject } from 'react';

/**
 * 값이 바뀔 때마다 요소의 CSS 애니메이션을 처음부터 다시 재생한다.
 * 요소를 다시 그리지 않으므로 포커스와 입력 상태가 유지된다.
 * @param ref 애니메이션이 걸린 요소
 * @param trigger 바뀔 때 애니메이션을 다시 시작하는 값
 */
export function useRestartAnimation(ref: RefObject<HTMLElement | null>, trigger: unknown) {
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.style.animationName = 'none';
    // 스타일을 한 번 읽어 애니메이션 해제를 반영시킨 뒤 되돌려야 처음부터 다시 재생된다.
    void element.offsetWidth;
    element.style.removeProperty('animation-name');
  }, [ref, trigger]);
}
