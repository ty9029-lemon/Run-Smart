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

export const ICON_BUTTON_SIZES = ['icon-lg', 'icon', 'icon-sm', 'icon-xs'] as const;

export const ICON_BUTTON_VARIANTS = ['default', 'secondary', 'ghost'] as const;

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

/** 차트 샘플 데이터: 시간대별 러닝 지수와 기온 */
export const CHART_DATA = [
  { hour: '06시', score: 62, temp: 8, prev: 55 },
  { hour: '09시', score: 72, temp: 12, prev: 60 },
  { hour: '12시', score: 58, temp: 17, prev: 64 },
  { hour: '15시', score: 49, temp: 19, prev: 52 },
  { hour: '18시', score: 68, temp: 15, prev: 58 },
  { hour: '21시', score: 76, temp: 11, prev: 66 },
] as const;

/** 방사형(점수 링) 샘플 값: 러닝 지수 (0~100) */
export const RADIAL_SCORE = 72;
export const RADIAL_MAX_ANGLE = 360;
export const RADIAL_INNER_RADIUS = 70;
export const RADIAL_OUTER_RADIUS = 100;

/** 도넛 샘플: 활동 비율 */
export const DONUT_DATA = [
  { name: 'running', value: 52, fill: 'var(--color-running)' },
  { name: 'cycling', value: 30, fill: 'var(--color-cycling)' },
  { name: 'hiking', value: 18, fill: 'var(--color-hiking)' },
] as const;
export const DONUT_INNER_RADIUS = 60;

export const CHART_HEIGHT_CLASS = 'h-56 w-full';
export const BAR_RADIUS = 6;
