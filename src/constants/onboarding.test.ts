import { describe, expect, it } from 'vitest';
import { CONSTRAINTS } from './activities';
import { ONBOARDING_STEPS } from './onboarding';

describe('온보딩 제약사항 단계', () => {
  it('질문이 활동할 때 신경 쓸 점을 묻는다', () => {
    const step = ONBOARDING_STEPS.find((s) => s.id === 'constraint');
    expect(step?.title).toBe('활동할 때 신경 쓸 점이 있나요?');
  });

  it('선택지에 비염이 포함된다', () => {
    expect(CONSTRAINTS.map((c) => c.label)).toContain('비염');
  });
});
