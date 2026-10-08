import {
  SENSITIVITY_DEFAULT,
  SENSITIVITY_DEGREE_PER_LEVEL,
  SENSITIVITY_MAX,
  SENSITIVITY_MIN,
} from '../constants/thresholds';
import type { Profile, Sensitivity } from '../types';

/** 제거된 활동 id */
const REMOVED_ACTIVITY = 'outing';

/** 이전 버전 저장 형태 (활동별 보정값을 가진다) */
export interface LegacyProfileState {
  profile: Omit<Partial<Profile>, 'selectedActivities' | 'lastActivity'> & {
    selectedActivities: string[];
    lastActivity: string | null;
    offsets?: Record<string, number>;
  };
  hasOnboarded: boolean;
}

/** 최소~최대 단계 안으로 자른다. */
function clampLevel(level: number): number {
  return Math.min(SENSITIVITY_MAX, Math.max(SENSITIVITY_MIN, level));
}

/**
 * 선택 활동의 평균 보정값(°C)을 추위·더위 단계로 바꾼다.
 * 음수면 추위, 양수면 더위 민감도로 옮기고 나머지는 보통으로 둔다.
 * @param offsets 활동별 보정값
 * @param activities 선택한 활동
 */
export function offsetsToSensitivity(
  offsets: Record<string, number> = {},
  activities: string[] = [],
): Sensitivity {
  const values = activities.map((id) => offsets[id] ?? 0);
  const average = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const levels = Math.round(average / SENSITIVITY_DEGREE_PER_LEVEL);
  return {
    coldLevel: clampLevel(SENSITIVITY_DEFAULT + Math.max(0, -levels)),
    heatLevel: clampLevel(SENSITIVITY_DEFAULT + Math.max(0, levels)),
  };
}

/** v0 → v1: 제거된 '외출' 활동을 정리한다. 선택 활동이 비면 온보딩을 다시 거친다. */
function removeOutingActivity(state: LegacyProfileState): LegacyProfileState {
  const { profile } = state;
  const selectedActivities = profile.selectedActivities.filter((id) => id !== REMOVED_ACTIVITY);
  const lastActivity =
    profile.lastActivity === REMOVED_ACTIVITY ? (selectedActivities[0] ?? null) : profile.lastActivity;
  return {
    hasOnboarded: state.hasOnboarded && selectedActivities.length > 0,
    profile: { ...profile, selectedActivities, lastActivity },
  };
}

/** v1 → v2: 활동별 보정값을 추위·더위 단계로 바꾼다. */
function convertOffsets(state: LegacyProfileState): LegacyProfileState {
  const { offsets, ...rest } = state.profile;
  const sensitivity = offsetsToSensitivity(offsets, rest.selectedActivities);
  return { ...state, profile: { ...rest, ...sensitivity } };
}

/** v2 → v3: 피드백 보정값을 0으로 시작한다. */
function addFeedbackOffset(state: LegacyProfileState): LegacyProfileState {
  return { ...state, profile: { ...state.profile, feedbackOffset: 0 } };
}

/**
 * 저장된 프로필을 현재 버전 형태로 옮긴다.
 * @param persisted localStorage에서 읽은 값
 * @param version 저장된 버전
 */
export function migrateProfileState(persisted: unknown, version: number): unknown {
  let state = persisted as LegacyProfileState;
  if (version < 1) state = removeOutingActivity(state);
  if (version < 2) state = convertOffsets(state);
  if (version < 3) state = addFeedbackOffset(state);
  return state;
}
