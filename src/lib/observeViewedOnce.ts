/** 노출 인정 조건 */
export interface ViewedOnceOptions {
  /** 노출로 인정할 최소 가시 비율 (0~1) */
  ratio: number;
  /** 노출로 인정할 최소 유지 시간(ms) */
  dwellMs: number;
}

/**
 * 요소가 일정 비율 이상 일정 시간 이상 보이면 콜백을 한 번만 호출한다.
 * @param element 관찰할 요소
 * @param onView 노출 조건을 만족했을 때 호출할 콜백
 * @param options 가시 비율과 유지 시간
 * @returns 관찰을 멈추는 정리 함수 (IntersectionObserver가 없으면 아무 일도 하지 않는다)
 */
export function observeViewedOnce(
  element: Element,
  onView: () => void,
  { ratio, dwellMs }: ViewedOnceOptions,
): () => void {
  if (typeof IntersectionObserver === 'undefined') return () => {};

  let timer: ReturnType<typeof setTimeout> | null = null;
  const clearTimer = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.intersectionRatio < ratio) return clearTimer();
      if (timer !== null) return;
      timer = setTimeout(() => {
        observer.disconnect();
        onView();
      }, dwellMs);
    },
    { threshold: [ratio] },
  );
  observer.observe(element);

  return () => {
    clearTimer();
    observer.disconnect();
  };
}
