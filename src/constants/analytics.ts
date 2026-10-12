/** cta_clicked 이벤트의 cta 속성값 (어떤 버튼을 눌렀는지 구분) */
export const CTA_IDS = {
  onboardingStart: 'onboarding_start',
  locationAllow: 'location_allow',
  locationSettings: 'location_settings',
  settingsSave: 'settings_save',
} as const;

export type CtaId = (typeof CTA_IDS)[keyof typeof CTA_IDS];

/** activity_disabled_clicked 이벤트의 screen 속성값 (어느 화면에서 눌렀는지 구분) */
export const ACTIVITY_SCREENS = {
  home: 'home',
  settings: 'settings',
  onboarding: 'onboarding',
} as const;

export type ActivityScreen = (typeof ACTIVITY_SCREENS)[keyof typeof ACTIVITY_SCREENS];

/** outfit_viewed 이벤트의 source 속성값 (어느 화면의 복장 패널인지 구분) */
export const OUTFIT_SOURCES = {
  home: 'home',
  history: 'history',
} as const;

export type OutfitSource = (typeof OUTFIT_SOURCES)[keyof typeof OUTFIT_SOURCES];

/** 복장 패널을 "봤다"고 인정하는 최소 가시 비율 */
export const OUTFIT_VIEW_RATIO = 0.5;

/** 복장 패널을 "봤다"고 인정하는 최소 노출 시간(ms) */
export const OUTFIT_VIEW_DWELL_MS = 1000;

/** UT 참가자 코드를 전달하는 URL 쿼리 파라미터 이름 (예: /?pid=P01) */
export const PARTICIPANT_ID_PARAM = 'pid';

/** 참가자 코드를 분석 도구에 저장할 때 쓰는 속성 이름 */
export const PARTICIPANT_ID_PROPERTY = 'participantId';

/** 참가자 코드 최대 길이 (이름·이메일 같은 개인정보가 들어오지 않도록 짧게 제한) */
export const PARTICIPANT_ID_MAX_LENGTH = 32;

/** 인앱 브라우저 여부를 분석 도구에 저장할 때 쓰는 속성 이름 */
export const IN_APP_BROWSER_PROPERTY = 'isInAppBrowser';

/** 인앱 브라우저 이름(instagram, kakaotalk 등)을 분석 도구에 저장할 때 쓰는 속성 이름 */
export const IN_APP_BROWSER_NAME_PROPERTY = 'inAppBrowserName';

/** 인앱 브라우저가 아닐 때 이름 속성에 넣는 값 */
export const IN_APP_BROWSER_NONE = 'none';

/**
 * 유입 채널 구분용 URL 파라미터와, 분석 도구에 저장할 속성 이름.
 * SDK의 자동 UTM 수집은 리다이렉트로 쿼리가 사라지면 놓칠 수 있어 초기화 시점에 직접 읽는다.
 */
export const ACQUISITION_PARAMS = {
  utm_source: 'utmSource',
  utm_medium: 'utmMedium',
  utm_campaign: 'utmCampaign',
} as const;

/** 유입 채널 속성값 최대 길이 (비정상적으로 긴 값 차단) */
export const ACQUISITION_VALUE_MAX_LENGTH = 64;
