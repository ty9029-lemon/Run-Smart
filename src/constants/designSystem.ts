/** /design-system 페이지에서 보여줄 variant·상태 목록과 샘플 값 */

export const BUTTON_VARIANTS = [
  'default',
  'outline',
  'secondary',
  'ghost',
  'destructive',
  'link',
] as const;

export const BUTTON_SIZES = ['default', 'sm'] as const;

export const BADGE_VARIANTS = [
  'default',
  'active',
  'secondary',
  'outline',
  'destructive',
  'ghost',
  'link',
] as const;

/** 칩 샘플: [라벨, 선택 여부, 비활성 여부] */
export const CHIP_SAMPLES = [
  { label: '러닝', selected: true, disabled: false },
  { label: '자전거', selected: false, disabled: false },
  { label: '등산', selected: false, disabled: true },
] as const;

export const TOGGLE_OPTIONS = ['러닝', '자전거', '등산'] as const;

export const SLIDER_MIN = 0;
export const SLIDER_MAX = 100;
export const SLIDER_VALUE = [40];
export const SLIDER_RANGE = [20, 70];
export const SLIDER_DISABLED_VALUE = [30];

/** 진행률 샘플 값 (%) */
export const PROGRESS_VALUES = [0, 40, 100] as const;

export const INPUT_PLACEHOLDER = '예: 서울시 마포구';
export const TEXTAREA_PLACEHOLDER = '오늘 컨디션을 적어 주세요';
