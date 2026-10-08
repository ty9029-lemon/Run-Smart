import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SENSITIVITY_DEFAULT } from '../constants/thresholds';
import { migrateProfileState } from '../lib/profileMigration';
import { applyFeedbackToOffset } from '../lib/feedback';
import type { Activity, Feedback, Profile } from '../types';

/** 기본 프로필: 러닝만 선택, 추위·더위 모두 보통 */
export const DEFAULT_PROFILE: Profile = {
  selectedActivities: ['running'],
  lastActivity: 'running',
  coldLevel: SENSITIVITY_DEFAULT,
  heatLevel: SENSITIVITY_DEFAULT,
  constraints: [],
  feedbackOffset: 0,
};

interface ProfileState {
  profile: Profile;
  /** 첫 진입 입력(온보딩)을 마쳤는지 여부 */
  hasOnboarded: boolean;
  saveProfile: (profile: Profile) => void;
  setLastActivity: (activity: Activity) => void;
  /** 체감 피드백을 보정값에 누적한다 */
  applyFeedback: (feedback: Feedback) => void;
  /** 피드백으로 학습한 보정값을 0으로 되돌린다 */
  resetFeedbackOffset: () => void;
}

/** 저장 데이터 버전 (1: '외출' 활동 제거, 2: 추위·더위 민감도로 교체, 3: 피드백 보정 추가) */
const PROFILE_STORE_VERSION = 3;

/** 사용자 프로필 스토어 (localStorage 저장) */
export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      hasOnboarded: false,
      // 프로필을 저장하면 온보딩도 완료된 것으로 본다. 학습된 피드백 보정은 유지한다.
      saveProfile: (profile) =>
        set((state) => ({
          profile: { ...profile, feedbackOffset: state.profile.feedbackOffset },
          hasOnboarded: true,
        })),
      setLastActivity: (activity) =>
        set((state) => ({ profile: { ...state.profile, lastActivity: activity } })),
      applyFeedback: (feedback) =>
        set((state) => ({
          profile: {
            ...state.profile,
            feedbackOffset: applyFeedbackToOffset(state.profile.feedbackOffset, feedback),
          },
        })),
      resetFeedbackOffset: () =>
        set((state) => ({ profile: { ...state.profile, feedbackOffset: 0 } })),
    }),
    {
      name: 'run-smart-profile',
      version: PROFILE_STORE_VERSION,
      migrate: (persisted, version) => migrateProfileState(persisted, version) as ProfileState,
    },
  ),
);
