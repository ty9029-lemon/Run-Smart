import * as amplitude from '@amplitude/analytics-browser';
import mixpanel from 'mixpanel-browser';
import { PARTICIPANT_ID_PROPERTY } from '../constants/analytics';
import { logger } from './logger';
import { parseParticipantId } from './participantId';

/** Amplitude 초기화 여부 (StrictMode의 이중 effect 실행 대응) */
let isAmplitudeReady = false;
/** Mixpanel 초기화 여부 (StrictMode의 이중 effect 실행 대응) */
let isMixpanelReady = false;
/** 마지막으로 등록한 UT 참가자 코드 (같은 값의 중복 등록 방지) */
let registeredParticipantId: string | null = null;

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
  outfitViewed: 'outfit_viewed',
  feedbackSubmitted: 'feedback_submitted',
  ctaClicked: 'cta_clicked',
  settingsSaved: 'settings_saved',
  appReviewShown: 'app_review_shown',
  appReviewSubmitted: 'app_review_submitted',
  appReviewDismissed: 'app_review_dismissed',
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

/**
 * UT 참가자 코드를 두 도구에 등록한다. 사용자 ID는 바꾸지 않고 속성으로만 붙인다.
 * Amplitude는 사용자 속성, Mixpanel은 모든 이벤트에 붙는 super property로 저장된다.
 * @param participantId 검증된 참가자 코드
 */
function registerParticipant(participantId: string): void {
  if (participantId === registeredParticipantId) return;
  registeredParticipantId = participantId;
  if (isAmplitudeReady) {
    amplitude.identify(new amplitude.Identify().set(PARTICIPANT_ID_PROPERTY, participantId));
  }
  if (isMixpanelReady) mixpanel.register({ [PARTICIPANT_ID_PROPERTY]: participantId });
}

/** 현재 URL의 쿼리 문자열 (브라우저가 아니면 빈 문자열) */
function getLocationSearch(): string {
  return typeof window === 'undefined' ? '' : window.location.search;
}

/**
 * 분석 도구(Amplitude, Mixpanel)를 초기화하고, URL에 유효한 UT 참가자 코드가 있으면 등록한다.
 * @param search 참가자 코드를 읽을 쿼리 문자열 (기본: 현재 URL)
 */
export function initAnalytics(search: string = getLocationSearch()): void {
  initAmplitude();
  initMixpanel();
  const participantId = parseParticipantId(search);
  if (participantId) registerParticipant(participantId);
}
