import { useEffect, useRef, type RefObject } from 'react';

/** 포커스를 되돌려 줄 버튼: 컨테이너 안에서 눌러 쓸 수 있는 마지막 버튼 (다음 / 시작하기) */
const PRIMARY_BUTTON_SELECTOR = 'button:last-of-type:not(:disabled)';

/**
 * 값이 바뀐 뒤 포커스가 문서로 빠졌다면 컨테이너의 주 버튼으로 되돌린다.
 * 눌렀던 버튼이 사라지는 전환(예: 2단계에서 [이전]을 눌러 1단계로 돌아가면 [이전]이 없어진다)에서
 * 키보드·스크린 리더 사용자가 포커스를 잃지 않게 한다. 포커스가 다른 곳에 있으면 건드리지 않는다.
 * @param containerRef 주 버튼을 품은 컨테이너
 * @param trigger 바뀔 때 포커스를 확인하는 값
 */
export function useRestoreFocus(containerRef: RefObject<HTMLElement | null>, trigger: unknown) {
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const active = document.activeElement;
    if (active && active !== document.body) return;
    containerRef.current?.querySelector<HTMLElement>(PRIMARY_BUTTON_SELECTOR)?.focus({
      preventScroll: true,
    });
  }, [containerRef, trigger]);
}
