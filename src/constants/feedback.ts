import type { Feedback } from '../types';

/** 운동 후 체감 피드백 라벨 */
export const FEEDBACK_LABELS: Record<Feedback, string> = {
  cold: '추웠어요',
  good: '적당했어요',
  hot: '더웠어요',
};

/** 피드백 선택지 표시 순서 */
export const FEEDBACK_ORDER: Feedback[] = ['cold', 'good', 'hot'];

/** 거리 입력 기본값(km). 사용자가 +/-를 누르기 전에는 저장하지 않는다 */
export const DEFAULT_DISTANCE_KM = 5;

/** 거리 +/- 한 번에 바뀌는 값(km) */
export const DISTANCE_STEP_KM = 0.5;

/** 입력할 수 있는 최소 거리(km) */
export const MIN_DISTANCE_KM = 0.5;

/** 입력할 수 있는 최대 거리(km) */
export const MAX_DISTANCE_KM = 100;

/** 거리 입력창 최대 글자 수 (예: 42.195) */
export const DISTANCE_INPUT_MAX_LENGTH = 6;

/** 거리를 소수 몇째 자리까지 남길지 (곱해서 반올림하는 단위) */
export const DISTANCE_DECIMAL_UNIT = 100;

/** 실제 착용 복장 최대 글자 수 */
export const ACTUAL_OUTFIT_MAX_LENGTH = 100;
