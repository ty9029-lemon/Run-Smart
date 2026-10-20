import { describe, expect, it } from 'vitest';
import { getStepDirection } from './stepDirection';

describe('getStepDirection', () => {
  it('다음 단계로 가면 forward', () => {
    expect(getStepDirection(0, 1)).toBe('forward');
    expect(getStepDirection(2, 3)).toBe('forward');
  });

  it('이전 단계로 돌아가면 back', () => {
    expect(getStepDirection(3, 2)).toBe('back');
    expect(getStepDirection(1, 0)).toBe('back');
  });

  it('같은 단계는 forward로 본다', () => {
    expect(getStepDirection(1, 1)).toBe('forward');
  });
});
