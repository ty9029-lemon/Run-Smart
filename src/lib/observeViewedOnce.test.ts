import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { observeViewedOnce } from './observeViewedOnce';

const RATIO = 0.5;
const DWELL_MS = 1000;
const OPTIONS = { ratio: RATIO, dwellMs: DWELL_MS };

type ObserverCallback = (entries: { intersectionRatio: number }[]) => void;

/** 테스트에서 노출 비율을 직접 흘려보낼 수 있는 IntersectionObserver 대역 */
function installObserverStub() {
  const disconnect = vi.fn();
  let callback: ObserverCallback = () => {};
  class StubObserver {
    constructor(cb: ObserverCallback) {
      callback = cb;
    }
    observe = vi.fn();
    disconnect = disconnect;
  }
  vi.stubGlobal('IntersectionObserver', StubObserver);
  return {
    disconnect,
    emit: (intersectionRatio: number) => callback([{ intersectionRatio }]),
  };
}

describe('observeViewedOnce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('조건 비율 이상이 유지 시간 동안 보이면 한 번만 호출한다', () => {
    const stub = installObserverStub();
    const onView = vi.fn();
    observeViewedOnce({} as Element, onView, OPTIONS);

    stub.emit(1);
    stub.emit(1);
    vi.advanceTimersByTime(DWELL_MS);

    expect(onView).toHaveBeenCalledTimes(1);
    expect(stub.disconnect).toHaveBeenCalled();
  });

  it('유지 시간 전에 가려지면 호출하지 않는다', () => {
    const stub = installObserverStub();
    const onView = vi.fn();
    observeViewedOnce({} as Element, onView, OPTIONS);

    stub.emit(1);
    vi.advanceTimersByTime(DWELL_MS - 1);
    stub.emit(0);
    vi.advanceTimersByTime(DWELL_MS);

    expect(onView).not.toHaveBeenCalled();
  });

  it('가시 비율이 기준에 못 미치면 호출하지 않는다', () => {
    const stub = installObserverStub();
    const onView = vi.fn();
    observeViewedOnce({} as Element, onView, OPTIONS);

    stub.emit(RATIO - 0.1);
    vi.advanceTimersByTime(DWELL_MS);

    expect(onView).not.toHaveBeenCalled();
  });

  it('정리 함수를 호출하면 대기 중인 노출 판정을 취소한다', () => {
    const stub = installObserverStub();
    const onView = vi.fn();
    const cleanup = observeViewedOnce({} as Element, onView, OPTIONS);

    stub.emit(1);
    cleanup();
    vi.advanceTimersByTime(DWELL_MS);

    expect(onView).not.toHaveBeenCalled();
  });

  it('IntersectionObserver가 없으면 조용히 건너뛴다', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const onView = vi.fn();

    const cleanup = observeViewedOnce({} as Element, onView, OPTIONS);
    cleanup();

    expect(onView).not.toHaveBeenCalled();
  });
});
