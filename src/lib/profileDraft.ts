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

/** 순서와 관계없이 두 목록이 같은 항목을 담고 있는지 확인한다. */
function hasSameItems<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((item) => b.includes(item));
}

/**
 * 초안이 저장된 프로필과 달라졌는지 확인한다. (설정 화면의 저장 버튼 활성화 기준)
 * 피드백 보정(feedbackOffset)은 설정에서 바로 저장소에 반영되고 저장할 때도 유지되므로 비교하지 않는다.
 * 마지막 활동(lastActivity)은 선택한 활동에 맞춰 저장할 때 정해지므로 비교하지 않는다.
 * 목록은 순서가 달라도 같은 항목이면 같은 값으로 본다. (고른 뒤 해제하고 다시 고르면 순서만 바뀐다)
 * @param saved 저장된 프로필
 * @param draft 화면에서 편집 중인 초안
 */
export function isProfileChanged(saved: Profile, draft: Profile): boolean {
  return (
    saved.coldLevel !== draft.coldLevel ||
    saved.heatLevel !== draft.heatLevel ||
    saved.useCurrentLocation !== draft.useCurrentLocation ||
    !hasSameItems(saved.selectedActivities, draft.selectedActivities) ||
    !hasSameItems(saved.constraints, draft.constraints) ||
    !hasSameItems(saved.activityTimeSlots, draft.activityTimeSlots)
  );
}
