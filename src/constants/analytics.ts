/** cta_clicked 이벤트의 cta 속성값 (어떤 버튼을 눌렀는지 구분) */
export const CTA_IDS = {
  onboardingStart: 'onboarding_start',
  locationAllow: 'location_allow',
  locationSettings: 'location_settings',
  settingsSave: 'settings_save',
} as const;

export type CtaId = (typeof CTA_IDS)[keyof typeof CTA_IDS];
