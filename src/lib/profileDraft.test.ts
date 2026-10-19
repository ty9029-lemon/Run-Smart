import { describe, expect, it } from 'vitest';
import { toggleActivityTimeSlot } from './profileDraft';
import { DEFAULT_PROFILE } from '../store/profileStore';

describe('toggleActivityTimeSlot', () => {
  it('없으면 추가하고 있으면 뺀다', () => {
    const added = toggleActivityTimeSlot(DEFAULT_PROFILE, 'afterWork');
    expect(added.activityTimeSlots).toEqual(['afterWork']);
    const removed = toggleActivityTimeSlot(added, 'afterWork');
    expect(removed.activityTimeSlots).toEqual([]);
  });

  it('항상 다름을 고르면 다른 시간대가 해제된다', () => {
    const picked = toggleActivityTimeSlot(
      toggleActivityTimeSlot(DEFAULT_PROFILE, 'beforeWork'),
      'afterWork',
    );
    const result = toggleActivityTimeSlot(picked, 'irregular');
    expect(result.activityTimeSlots).toEqual(['irregular']);
  });

  it('항상 다름을 고른 뒤 특정 시간대를 고르면 항상 다름이 해제된다', () => {
    const irregular = toggleActivityTimeSlot(DEFAULT_PROFILE, 'irregular');
    const result = toggleActivityTimeSlot(irregular, 'weekendMorning');
    expect(result.activityTimeSlots).toEqual(['weekendMorning']);
  });
});
