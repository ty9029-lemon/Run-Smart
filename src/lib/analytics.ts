import * as amplitude from '@amplitude/analytics-browser';
import mixpanel from 'mixpanel-browser';
import {
  HOSTNAME_PROPERTY,
  IN_APP_BROWSER_NAME_PROPERTY,
  IN_APP_BROWSER_PROPERTY,
  PARTICIPANT_ID_PROPERTY,
  PRODUCTION_HOSTNAME,
} from '../constants/analytics';
import { parseAcquisition } from './acquisition';
import { detectInAppBrowser } from './inAppBrowser';
import { logger } from './logger';
import { parseParticipantId } from './participantId';

/** Amplitude 초기화 여부 (StrictMode의 이중 effect 실행 대응) */
let isAmplitudeReady = false;
/** Mixpanel 초기화 여부 (StrictMode의 이중 effect 실행 대응) */
let isMixpanelReady = false;
/** 마지막으로 Amplitude에 등록한 사용자 속성 (같은 값의 중복 등록 방지) */
let registeredUserPropsKey: string | null = null;

/** 모든 이벤트(사용자)에 붙이는 속성 (참가자 코드, 인앱 브라우저 여부 등) */
type UserProps = Record<string, string | boolean>;

/** 첫 접속 시점의 값만 남기는 속성 (유입 채널 등) */
type FirstTouchProps = Record<string, string>;

/** 커스텀 이벤트 이름 */
export const ANALYTICS_EVENTS = {
  onboardingCompleted: 'onboarding_completed',
  runScoreViewed: 'run_score_viewed',
  decisionMade: 'decision_made',
  decisionCancelled: 'decision_cancelled',
  activityEnded: 'activity_ended',
  activityEndDismissed: 'activity_end_dismissed',
  activityChanged: 'activity_changed',
  activityDisabledClicked: 'activity_disabled_clicked',
  dataLoadFailed: 'data_load_failed',
  hourlyForecastScrolled: 'hourly_forecast_scrolled',
  historyOpened: 'history_opened',
  tabClicked: 'tab_clicked',
  historyEntryViewed: 'history_entry_viewed',
  outfitViewed: 'outfit_viewed',
  feedbackSubmitted: 'feedback_submitted',
  feedbackSheetDismissed: 'feedback_sheet_dismissed',
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
 * Mixpanel을 초기화한다. 사용자 속성은 초기화 직후(loaded) super property로 등록해 이후 이벤트에 모두 붙인다.
 * 토큰이 없으면 경고만 남기고 건너뛴다.
 * @param userProps 모든 이벤트에 붙일 속성
 * @param firstTouchProps 처음 등록된 값만 유지할 속성 (유입 채널)
 */
function initMixpanel(userProps: UserProps, firstTouchProps: FirstTouchProps): void {
  if (isMixpanelReady) return;

  const token = import.meta.env.VITE_MIXPANEL_TOKEN;
  if (!token) {
    logger.warn('VITE_MIXPANEL_TOKEN이 없어 Mixpanel 초기화를 건너뜁니다.');
    return;
  }

  mixpanel.init(token, {
    // 자동 페이지뷰는 끈다. 초기화 시점에 발생하면 사용자 속성이 등록되기 전이라 속성이 빠진다.
    // 대신 속성을 등록한 뒤 trackPageView로 직접 기록한다.
    track_pageview: false,
    persistence: 'localStorage',
    loaded: (instance) => {
      instance.register(userProps);
      instance.register_once(firstTouchProps);
    },
  });
  isMixpanelReady = true;
}

/**
 * 페이지뷰를 Mixpanel에 기록한다. 경로가 바뀔 때 호출한다.
 * 사용자 속성이 등록된 뒤에 호출해야 첫 페이지뷰에도 속성이 붙는다.
 */
export function trackPageView(): void {
  if (isMixpanelReady) mixpanel.track_pageview();
}

/**
 * 사용자 속성을 Amplitude 사용자 속성으로 등록한다. 사용자 ID는 바꾸지 않는다.
 * (Mixpanel은 초기화 시점에 super property로 등록된다.)
 * @param userProps 매번 최신 값으로 덮어쓸 속성
 * @param firstTouchProps 처음 등록된 값만 유지할 속성
 */
function registerAmplitudeUserProps(userProps: UserProps, firstTouchProps: FirstTouchProps): void {
  const key = JSON.stringify([userProps, firstTouchProps]);
  if (!isAmplitudeReady || key === registeredUserPropsKey) return;
  registeredUserPropsKey = key;
  const identify = new amplitude.Identify();
  Object.entries(userProps).forEach(([name, value]) => identify.set(name, value));
  Object.entries(firstTouchProps).forEach(([name, value]) => identify.setOnce(name, value));
  amplitude.identify(identify);
}

/** 현재 URL의 쿼리 문자열 (브라우저가 아니면 빈 문자열) */
function getLocationSearch(): string {
  return typeof window === 'undefined' ? '' : window.location.search;
}

/** 현재 브라우저의 User-Agent (브라우저가 아니면 빈 문자열) */
function getUserAgent(): string {
  return typeof navigator === 'undefined' ? '' : navigator.userAgent;
}

/** 현재 접속 호스트 (브라우저가 아니면 빈 문자열) */
function getHostname(): string {
  return typeof window === 'undefined' ? '' : window.location.hostname;
}

/**
 * 이벤트에 붙일 사용자 속성을 만든다.
 * 인앱 브라우저 여부는 항상 포함하고, 참가자 코드와 접속 호스트는 값이 있을 때만 포함한다.
 */
function buildUserProps(search: string, userAgent: string, hostname: string): UserProps {
  const { isInAppBrowser, inAppBrowserName } = detectInAppBrowser(userAgent);
  const participantId = parseParticipantId(search);
  return {
    ...(participantId ? { [PARTICIPANT_ID_PROPERTY]: participantId } : {}),
    ...(hostname ? { [HOSTNAME_PROPERTY]: hostname } : {}),
    [IN_APP_BROWSER_PROPERTY]: isInAppBrowser,
    [IN_APP_BROWSER_NAME_PROPERTY]: inAppBrowserName,
  };
}

/**
 * 분석 도구(Amplitude, Mixpanel)를 초기화하고 사용자 속성을 등록한다.
 * 운영 호스트가 아니면(로컬·Preview) 개발 이벤트가 실제 데이터에 섞이지 않도록 초기화하지 않는다.
 * 속성: 참가자 코드(URL ?pid=, 유효할 때만), 접속 호스트, 인앱 브라우저 여부와 앱 이름,
 * 첫 접속의 유입 채널(utm_source·utm_medium·utm_campaign, 처음 값만 유지)
 * @param search 참가자 코드를 읽을 쿼리 문자열 (기본: 현재 URL)
 * @param userAgent 인앱 브라우저를 판별할 User-Agent (기본: 현재 브라우저)
 * @param hostname 접속 호스트 (기본: 현재 주소의 호스트)
 */
export function initAnalytics(
  search: string = getLocationSearch(),
  userAgent: string = getUserAgent(),
  hostname: string = getHostname(),
): void {
  if (hostname !== PRODUCTION_HOSTNAME) {
    logger.info('운영 호스트가 아니라 분석 도구 초기화를 건너뜁니다.');
    return;
  }

  const userProps = buildUserProps(search, userAgent, hostname);
  // 리다이렉트로 쿼리가 사라지기 전에 동기적으로 읽어 둔다
  const firstTouchProps = parseAcquisition(search);
  initAmplitude();
  initMixpanel(userProps, firstTouchProps);
  registerAmplitudeUserProps(userProps, firstTouchProps);
}
