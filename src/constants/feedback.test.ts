import { describe, expect, it } from 'vitest';
import { FEEDBACK_LABELS, FEEDBACK_ORDER, formatFeedbackTitle } from './feedback';

describe('FEEDBACK_LABELS', () => {
  it('모든 피드백 값에 라벨이 있다', () => {
    expect(FEEDBACK_ORDER.map((v) => FEEDBACK_LABELS[v])).toEqual([
      '추웠어요',
      '적당했어요',
      '더웠어요',
    ]);
  });
});

describe('formatFeedbackTitle', () => {
  it('시각과 활동명으로 질문 제목을 만든다', () => {
    expect(formatFeedbackTitle('오후 10:07', '러닝')).toBe('오후 10:07 러닝, 어땠어요?');
  });
});
