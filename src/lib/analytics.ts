import * as amplitude from '@amplitude/analytics-browser';
import mixpanel from 'mixpanel-browser';
import { logger } from './logger';

/** Amplitude 초기화 여부 (StrictMode의 이중 effect 실행 대응) */
let isAmplitudeReady = false;
/** Mixpanel 초기화 여부 (StrictMode의 이중 effect 실행 대응) */
let isMixpanelReady = false;

/** 커스텀 이벤트 이름 */
export const ANALYTICS_EVENTS = {
  onboardingCompleted: 'onboarding_completed',
  runScoreViewed: 'run_score_viewed',
  decisionMade: 'decision_made',
  decisionCancelled: 'decision_cancelled',
  activityChanged: 'activity_changed',
  activityDisabledClicked: 'activity_disabled_clicked',
  dataLoadFailed: 'data_load_failed',
  hourlyForecastScrolled: 'hourly_forecast_scrolled',
  historyOpened: 'history_opened',
  historyEntryViewed: 'history_entry_viewed',
  feedbackSubmitted: 'feedback_submitted',
  ctaClicked: 'cta_clicked',
  settingsSaved: 'settings_saved',
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/** 이벤트 속성 (정확한 위치·좌표 같은 개인정보는 넣지 않는다) */
export type AnalyticsProps = Record<string, string | number | boolean>;

/**
 * 커스텀 이벤트를 Amplitude와 Mixpanel로 보낸다. 초기화된 쪽에만 전송한다.
 * @param name 이벤트 이름
 * @param props 이벤트 속성
 */
export function trackEvent(name: AnalyticsEventName, props?: AnalyticsProps): void {
  if (isAmplitudeReady) amplitude.track(name, props);
  if (isMixpanelReady) mixpanel.track(name, props);
}

/**
 * Amplitude를 초기화하고 페이지뷰·클릭·폼 입력 자동 수집을 켠다.
 * API 키가 없으면 경고만 남기고 건너뛴다.
 */
function initAmplitude(): void {
  if (isAmplitudeReady) return;

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
  isAmplitudeReady = true;
}

/**
 * Mixpanel을 초기화하고 경로 변경 기준 페이지뷰 자동 수집을 켠다.
 * 토큰이 없으면 경고만 남기고 건너뛴다.
 */
function initMixpanel(): void {
  if (isMixpanelReady) return;

  const token = import.meta.env.VITE_MIXPANEL_TOKEN;
  if (!token) {
    logger.warn('VITE_MIXPANEL_TOKEN이 없어 Mixpanel 초기화를 건너뜁니다.');
    return;
  }

  mixpanel.init(token, {
    // SPA 라우팅에서 경로가 바뀔 때마다 페이지뷰를 기록한다 (쿼리·해시 변경은 무시)
    track_pageview: 'url-with-path',
    persistence: 'localStorage',
  });
  isMixpanelReady = true;
}

/** 분석 도구(Amplitude, Mixpanel)를 초기화한다. */
export function initAnalytics(): void {
  initAmplitude();
  initMixpanel();
}
