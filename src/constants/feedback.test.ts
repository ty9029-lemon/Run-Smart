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

  it('지난 날이면 말머리를 앞에 붙인다', () => {
    expect(formatFeedbackTitle('오전 7:34', '러닝', '어제')).toBe('어제 오전 7:34 러닝, 어땠어요?');
  });
});
