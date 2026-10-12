import { describe, expect, it } from 'vitest';
import { ACTIVITIES, isActivityEnabled } from './activities';

describe('활동 활성 여부', () => {
  it('러닝만 활성이다', () => {
    const enabledIds = ACTIVITIES.filter((a) => a.enabled).map((a) => a.id);
    expect(enabledIds).toEqual(['running']);
  });

  it('isActivityEnabled는 비활성·알 수 없는 id에 false를 돌려준다', () => {
    expect(isActivityEnabled('running')).toBe(true);
    expect(isActivityEnabled('walking')).toBe(false);
    expect(isActivityEnabled('outing')).toBe(false);
  });
});
