import type { Feedback } from '../types';

/** 운동 후 체감 피드백 라벨 */
export const FEEDBACK_LABELS: Record<Feedback, string> = {
  cold: '추웠어요',
  good: '적당했어요',
  hot: '더웠어요',
};

/** 피드백 선택지 표시 순서 */
export const FEEDBACK_ORDER: Feedback[] = ['cold', 'good', 'hot'];
