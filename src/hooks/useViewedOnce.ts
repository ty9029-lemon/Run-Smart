import { useEffect, useRef, type RefObject } from 'react';
import { observeViewedOnce, type ViewedOnceOptions } from '../lib/observeViewedOnce';

/**
 * 요소가 일정 비율 이상 일정 시간 이상 화면에 보이면 콜백을 마운트당 한 번만 호출한다.
 * @param ref 관찰할 요소의 ref
 * @param onView 노출 조건을 만족했을 때 호출할 콜백
 * @param options 가시 비율과 유지 시간
 */
export function useViewedOnce(
  ref: RefObject<Element | null>,
  onView: () => void,
  { ratio, dwellMs }: ViewedOnceOptions,
): void {
  // 콜백이 바뀌어도 observer를 다시 만들지 않도록 최신 값만 보관한다
  const onViewRef = useRef(onView);
  useEffect(() => {
    onViewRef.current = onView;
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    return observeViewedOnce(element, () => onViewRef.current(), { ratio, dwellMs });
  }, [ref, ratio, dwellMs]);
}
