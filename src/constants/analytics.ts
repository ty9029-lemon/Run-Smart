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
