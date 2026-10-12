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
