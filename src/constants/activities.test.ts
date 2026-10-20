import { describe, expect, it } from 'vitest';
import { ACTIVITIES, ACTIVITY_TIME_SLOTS, isActivityEnabled } from './activities';

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

describe('활동 표시 순서', () => {
  it('러닝, 자전거, 등산, 산책 순서다', () => {
    expect(ACTIVITIES.map((a) => a.id)).toEqual(['running', 'cycling', 'hiking', 'walking']);
  });

  it('시간대는 6종(항상 다름 포함)이고 id가 겹치지 않는다', () => {
    const ids = ACTIVITY_TIME_SLOTS.map((slot) => slot.id);
    expect(ids).toHaveLength(6);
    expect(new Set(ids).size).toBe(6);
  });
});
