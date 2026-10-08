import * as amplitude from '@amplitude/analytics-browser';
import { logger } from './logger';

/** 중복 초기화 방지 플래그 (StrictMode의 이중 effect 실행 대응) */
let isInitialized = false;

/** 커스텀 이벤트 이름 */
export const ANALYTICS_EVENTS = {
  onboardingCompleted: 'onboarding_completed',
  runScoreViewed: 'run_score_viewed',
  decisionMade: 'decision_made',
  activityChanged: 'activity_changed',
  dataLoadFailed: 'data_load_failed',
  hourlyForecastScrolled: 'hourly_forecast_scrolled',
  historyOpened: 'history_opened',
  historyEntryViewed: 'history_entry_viewed',
  feedbackSubmitted: 'feedback_submitted',
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/** 이벤트 속성 (정확한 위치·좌표 같은 개인정보는 넣지 않는다) */
export type AnalyticsProps = Record<string, string | number | boolean>;

/**
 * 커스텀 이벤트를 Amplitude로 보낸다. 초기화 전이면 무시한다.
 * @param name 이벤트 이름
 * @param props 이벤트 속성
 */
export function trackEvent(name: AnalyticsEventName, props?: AnalyticsProps): void {
  if (!isInitialized) return;
  amplitude.track(name, props);
}

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
