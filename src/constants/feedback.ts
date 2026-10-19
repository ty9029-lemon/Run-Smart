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
} as const;

export type FeedbackSource = (typeof FEEDBACK_SOURCES)[keyof typeof FEEDBACK_SOURCES];

/** 체감 피드백 카드·시트 문구 */
export const FEEDBACK_MESSAGES = {
  ariaLabel: '운동 후 피드백',
  later: '다음에 할게요',
  thanks: '알려주셔서 고마워요. 다음 추천부터 반영할게요.',
  sheetDescription: '답해 주시면 다음 추천에 반영돼요.',
} as const;

/**
 * 체감 피드백 질문 제목
 * @param timeText 활동 시각 표기 (예: 오후 10:07)
 * @param activityLabel 활동명 (예: 러닝)
 */
export function formatFeedbackTitle(timeText: string, activityLabel: string): string {
  return `${timeText} ${activityLabel}, 어땠어요?`;
}
