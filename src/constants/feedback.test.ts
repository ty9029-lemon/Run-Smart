import { describe, expect, it } from 'vitest';
import { FEEDBACK_LABELS, FEEDBACK_ORDER } from './feedback';

describe('FEEDBACK_LABELS', () => {
  it('모든 피드백 값에 라벨이 있다', () => {
    expect(FEEDBACK_ORDER.map((v) => FEEDBACK_LABELS[v])).toEqual([
      '추웠어요',
      '적당했어요',
      '더웠어요',
    ]);
  });
});
