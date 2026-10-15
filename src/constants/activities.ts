import type { Activity, Constraint } from '../types';

/** 활동 표시 정보 */
export interface ActivityMeta {
  id: Activity;
  label: string;
  emoji: string;
  /** 선택 가능 여부 (false면 "준비 중"으로 비활성 표시) */
  enabled: boolean;
  /** 기록 캘린더에서 활동한 날 숫자 아래에 찍는 점 색 (Tailwind 클래스) */
  calendarDot: string;
}

/** 비활성 활동 안내 문구 */
export const COMING_SOON_MESSAGE = '아직 준비 중인 기능이에요.';

/** 활동 4종 */
export const ACTIVITIES: ActivityMeta[] = [
  { id: 'running', label: '러닝', emoji: '🏃', enabled: true, calendarDot: 'bg-lime-pulse' },
  { id: 'hiking', label: '등산', emoji: '🥾', enabled: false, calendarDot: 'bg-amber-400' },
  { id: 'walking', label: '산책', emoji: '🚶', enabled: false, calendarDot: 'bg-sky-400' },
  { id: 'cycling', label: '자전거', emoji: '🚴', enabled: false, calendarDot: 'bg-fuchsia-400' },
];

/** 제약사항 표시 정보 */
export const CONSTRAINTS: { id: Constraint; label: string }[] = [
  { id: 'kneeIssue', label: '무릎 문제' },
  { id: 'uvSensitive', label: '자외선 민감' },
  { id: 'dustSensitive', label: '미세먼지 민감' },
  { id: 'asthma', label: '천식' },
  { id: 'rhinitis', label: '비염' },
];

/** 선택 가능한(비활성이 아닌) 활동인지 확인 */
export function isActivityEnabled(id: string): boolean {
  return ACTIVITIES.some((a) => a.id === id && a.enabled);
}

/** 활동 id로 표시 정보 조회 */
export function getActivityMeta(id: Activity): ActivityMeta {
  return ACTIVITIES.find((a) => a.id === id) ?? ACTIVITIES[0];
}
