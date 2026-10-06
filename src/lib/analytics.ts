import * as amplitude from '@amplitude/analytics-browser';
import { logger } from './logger';

/** 중복 초기화 방지 플래그 (StrictMode의 이중 effect 실행 대응) */
let isInitialized = false;

/**
 * Amplitude를 초기화하고 페이지뷰·클릭·폼 입력 자동 수집을 켠다.
 * API 키가 없으면 경고만 남기고 건너뛴다.
 */
export function initAnalytics(): void {
  if (isInitialized) return;

  const apiKey = import.meta.env.VITE_AMPLITUDE_API_KEY;
  if (!apiKey) {
    logger.warn('VITE_AMPLITUDE_API_KEY가 없어 Amplitude 초기화를 건너뜁니다.');
    return;
  }

  amplitude.init(apiKey, {
    autocapture: {
      pageViews: true,
      formInteractions: true,
      // 클릭 수집은 기본값이 꺼져 있어 명시적으로 켠다
      elementInteractions: true,
    },
  });
  isInitialized = true;
}
