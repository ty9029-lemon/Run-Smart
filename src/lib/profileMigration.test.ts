import { describe, expect, it } from 'vitest';
import { migrateProfileState, offsetsToSensitivity } from './profileMigration';

describe('offsetsToSensitivity', () => {
  it('보정값이 없으면 둘 다 보통이다', () => {
    expect(offsetsToSensitivity({}, [])).toEqual({ coldLevel: 3, heatLevel: 3 });
  });

  it('음수 평균은 추위 민감도로 옮긴다', () => {
    expect(offsetsToSensitivity({ running: -5, walking: -5 }, ['running', 'walking'])).toEqual({
      coldLevel: 5,
      heatLevel: 3,
    });
  });

  it('양수 평균은 더위 민감도로 옮긴다', () => {
    expect(offsetsToSensitivity({ running: 3 }, ['running'])).toEqual({
      coldLevel: 3,
      heatLevel: 4,
    });
  });
});

describe('migrateProfileState', () => {
  const legacy = {
    hasOnboarded: true,
    profile: {
      selectedActivities: ['outing', 'running'],
      lastActivity: 'outing',
      offsets: { running: -5, outing: 5 },
      constraints: [],
    },
  };

  it('v0 데이터에서 외출을 지우고 민감도로 바꾼다', () => {
    const migrated = migrateProfileState(legacy, 0) as typeof legacy;
    expect(migrated.profile).toEqual({
      selectedActivities: ['running'],
      lastActivity: 'running',
      constraints: [],
      coldLevel: 5,
      heatLevel: 3,
    });
    expect(migrated.hasOnboarded).toBe(true);
  });

  it('외출만 선택했던 사용자는 온보딩을 다시 거친다', () => {
    const onlyOuting = {
      ...legacy,
      profile: { ...legacy.profile, selectedActivities: ['outing'] },
    };
    const migrated = migrateProfileState(onlyOuting, 0) as typeof legacy;
    expect(migrated.hasOnboarded).toBe(false);
    expect(migrated.profile.lastActivity).toBeNull();
  });
});
