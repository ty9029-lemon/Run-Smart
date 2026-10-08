import type { Activity, Constraint } from '../types';

/** 활동 표시 정보 */
export interface ActivityMeta {
  id: Activity;
  label: string;
  emoji: string;
}

/** 활동 4종 */
export const ACTIVITIES: ActivityMeta[] = [
  { id: 'running', label: '러닝', emoji: '🏃' },
  { id: 'hiking', label: '등산', emoji: '🥾' },
  { id: 'walking', label: '산책', emoji: '🚶' },
  { id: 'cycling', label: '자전거', emoji: '🚴' },
];

/** 제약사항 표시 정보 */
export const CONSTRAINTS: { id: Constraint; label: string }[] = [
  { id: 'kneeIssue', label: '무릎 문제' },
  { id: 'uvSensitive', label: '자외선 민감' },
  { id: 'dustSensitive', label: '미세먼지 민감' },
  { id: 'asthma', label: '천식' },
];

/** 활동 id로 표시 정보 조회 */
export function getActivityMeta(id: Activity): ActivityMeta {
  return ACTIVITIES.find((a) => a.id === id) ?? ACTIVITIES[0];
}
