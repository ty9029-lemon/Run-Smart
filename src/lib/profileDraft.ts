import { MAX_ACTIVITIES } from '../constants/thresholds';
import type { Activity, Constraint, Profile } from '../types';

/**
 * 활동 선택을 토글한다. 최대 개수를 넘으면 추가하지 않는다.
 * @param profile 현재 프로필(초안)
 * @param id 토글할 활동
 */
export function toggleActivity(profile: Profile, id: Activity): Profile {
  const { selectedActivities } = profile;
  if (selectedActivities.includes(id)) {
    return { ...profile, selectedActivities: selectedActivities.filter((a) => a !== id) };
  }
  if (selectedActivities.length >= MAX_ACTIVITIES) return profile;
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

/** 마지막 활동이 선택 목록에 없으면 첫 번째 선택 활동으로 맞춘다. */
export function normalizeLastActivity(profile: Profile): Profile {
  const { lastActivity, selectedActivities } = profile;
  if (lastActivity && selectedActivities.includes(lastActivity)) return profile;
  return { ...profile, lastActivity: selectedActivities[0] ?? null };
}

/** 활동별 체감 온도 보정값을 바꾼다. */
export function setOffset(profile: Profile, id: Activity, value: number): Profile {
  return { ...profile, offsets: { ...profile.offsets, [id]: value } };
}
