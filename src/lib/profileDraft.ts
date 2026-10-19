import type { Activity, ActivityTimeSlot, Constraint, Profile } from '../types';

/**
 * 활동 선택을 토글한다.
 * @param profile 현재 프로필(초안)
 * @param id 토글할 활동
 */
export function toggleActivity(profile: Profile, id: Activity): Profile {
  const { selectedActivities } = profile;
  if (selectedActivities.includes(id)) {
    return { ...profile, selectedActivities: selectedActivities.filter((a) => a !== id) };
  }
  return { ...profile, selectedActivities: [...selectedActivities, id] };
}

/** 제약사항을 토글한다. */
export function toggleConstraint(profile: Profile, id: Constraint): Profile {
  const has = profile.constraints.includes(id);
  const constraints = has
    ? profile.constraints.filter((c) => c !== id)
    : [...profile.constraints, id];
  return { ...profile, constraints };
}

/**
 * 활동 시간대를 토글한다.
 * '항상 다름'은 특정 시간대와 함께 고를 수 없어서, 하나를 고르면 상대편은 해제한다.
 */
export function toggleActivityTimeSlot(profile: Profile, id: ActivityTimeSlot): Profile {
  const { activityTimeSlots } = profile;
  if (activityTimeSlots.includes(id)) {
    return { ...profile, activityTimeSlots: activityTimeSlots.filter((slot) => slot !== id) };
  }
  if (id === 'irregular') return { ...profile, activityTimeSlots: [id] };
  const specific = activityTimeSlots.filter((slot) => slot !== 'irregular');
  return { ...profile, activityTimeSlots: [...specific, id] };
}

/** 마지막 활동이 선택 목록에 없으면 첫 번째 선택 활동으로 맞춘다. */
export function normalizeLastActivity(profile: Profile): Profile {
  const { lastActivity, selectedActivities } = profile;
  if (lastActivity && selectedActivities.includes(lastActivity)) return profile;
  return { ...profile, lastActivity: selectedActivities[0] ?? null };
}

/**
 * 추위 또는 더위 민감도 단계를 바꾼다.
 * @param profile 현재 프로필(초안)
 * @param kind 바꿀 민감도 ('cold' 추위, 'heat' 더위)
 * @param level 새 단계
 */
export function setSensitivity(profile: Profile, kind: 'cold' | 'heat', level: number): Profile {
  return kind === 'cold' ? { ...profile, coldLevel: level } : { ...profile, heatLevel: level };
}
