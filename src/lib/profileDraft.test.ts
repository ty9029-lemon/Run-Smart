import { describe, expect, it } from 'vitest';
import { isProfileChanged, toggleActivityTimeSlot } from './profileDraft';
import { DEFAULT_PROFILE } from '../store/profileStore';
import type { Profile } from '../types';

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

describe('isProfileChanged', () => {
  const twoActivities: Profile = {
    ...DEFAULT_PROFILE,
    selectedActivities: ['running', 'hiking'],
  };

  it('저장된 값과 같으면 변경 없음으로 본다', () => {
    expect(isProfileChanged(DEFAULT_PROFILE, { ...DEFAULT_PROFILE })).toBe(false);
  });

  it('추위·더위 민감도나 위치 사용 여부가 달라지면 변경으로 본다', () => {
    expect(isProfileChanged(DEFAULT_PROFILE, { ...DEFAULT_PROFILE, coldLevel: 1 })).toBe(true);
    expect(isProfileChanged(DEFAULT_PROFILE, { ...DEFAULT_PROFILE, heatLevel: 5 })).toBe(true);
    expect(
      isProfileChanged(DEFAULT_PROFILE, { ...DEFAULT_PROFILE, useCurrentLocation: false }),
    ).toBe(true);
  });

  it('활동·제약사항·시간대 목록이 달라지면 변경으로 본다', () => {
    expect(isProfileChanged(DEFAULT_PROFILE, twoActivities)).toBe(true);
    expect(
      isProfileChanged(DEFAULT_PROFILE, { ...DEFAULT_PROFILE, constraints: ['kneeIssue'] }),
    ).toBe(true);
    expect(
      isProfileChanged(DEFAULT_PROFILE, { ...DEFAULT_PROFILE, activityTimeSlots: ['afterWork'] }),
    ).toBe(true);
  });

  it('고른 항목을 해제했다가 다시 골라 순서만 바뀌면 변경 없음으로 본다', () => {
    const reordered: Profile = { ...twoActivities, selectedActivities: ['hiking', 'running'] };
    expect(isProfileChanged(twoActivities, reordered)).toBe(false);
  });

  it('피드백 보정값과 마지막 활동이 달라도 변경으로 보지 않는다', () => {
    const draft: Profile = { ...DEFAULT_PROFILE, feedbackOffset: 1.5, lastActivity: null };
    expect(isProfileChanged(DEFAULT_PROFILE, draft)).toBe(false);
  });
});
