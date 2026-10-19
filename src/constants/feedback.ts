import type { Feedback } from '../types';

/** 운동 후 체감 피드백 라벨 */
export const FEEDBACK_LABELS: Record<Feedback, string> = {
  cold: '추웠어요',
  good: '적당했어요',
  hot: '더웠어요',
};

/** 피드백 선택지 표시 순서 */
export const FEEDBACK_ORDER: Feedback[] = ['cold', 'good', 'hot'];

/** feedback_submitted 이벤트의 source 속성값 (어디서 답했는지 구분) */
export const FEEDBACK_SOURCES = {
  sheet: 'sheet',
  card: 'card',
  history: 'history',
} as const;

export type FeedbackSource = (typeof FEEDBACK_SOURCES)[keyof typeof FEEDBACK_SOURCES];

/** 체감 피드백 카드·시트 문구 */
export const FEEDBACK_MESSAGES = {
  ariaLabel: '운동 후 피드백',
  later: '저장 안 할래요',
  save: '저장',
  thanks: '알려주셔서 고마워요. 다음 추천부터 반영할게요.',
  sheetDescription: '답해 주시면 다음 추천에 반영돼요.',
  historyPrompt: '체감은 어땠나요?',
} as const;

/**
 * 체감 피드백 질문 제목
 * @param timeText 활동 시각 표기 (예: 오후 10:07)
 * @param activityLabel 활동명 (예: 러닝)
 * @param dayPrefix 지난 날의 말머리 (예: 어제). 같은 날이면 빈 문자열
 */
export function formatFeedbackTitle(
  timeText: string,
  activityLabel: string,
  dayPrefix = '',
): string {
  return [dayPrefix, timeText, activityLabel].filter(Boolean).join(' ') + ', 어땠어요?';
}
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
