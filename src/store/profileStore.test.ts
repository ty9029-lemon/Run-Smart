import { describe, expect, it } from 'vitest';
import type { Profile } from '../types';
import { DEFAULT_PROFILE, withProfileDefaults } from './profileStore';

describe('withProfileDefaults', () => {
  it('필드를 추가하기 전에 저장된 프로필에는 새 필드를 기본값으로 채운다', () => {
    const legacy: Partial<Profile> = { ...DEFAULT_PROFILE, coldLevel: 5 };
    delete legacy.activityTimeSlots;
    const filled = withProfileDefaults(legacy);
    expect(filled.activityTimeSlots).toEqual([]);
    expect(filled.coldLevel).toBe(5);
  });

  it('저장된 값은 기본값보다 우선한다', () => {
    const filled = withProfileDefaults({ activityTimeSlots: ['afterWork'], useCurrentLocation: false });
    expect(filled.activityTimeSlots).toEqual(['afterWork']);
    expect(filled.useCurrentLocation).toBe(false);
  });

  it('빈 값이면 기본 프로필이 된다', () => {
    expect(withProfileDefaults({})).toEqual(DEFAULT_PROFILE);
  });
});
