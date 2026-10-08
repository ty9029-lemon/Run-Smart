import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SENSITIVITY_DEFAULT } from '../constants/thresholds';
import { migrateProfileState } from '../lib/profileMigration';
import type { Activity, Profile } from '../types';

/** 기본 프로필: 러닝만 선택, 추위·더위 모두 보통 */
export const DEFAULT_PROFILE: Profile = {
  selectedActivities: ['running'],
  lastActivity: 'running',
  coldLevel: SENSITIVITY_DEFAULT,
  heatLevel: SENSITIVITY_DEFAULT,
  constraints: [],
};

interface ProfileState {
  profile: Profile;
  /** 첫 진입 입력(온보딩)을 마쳤는지 여부 */
  hasOnboarded: boolean;
  saveProfile: (profile: Profile) => void;
  setLastActivity: (activity: Activity) => void;
}

/** 저장 데이터 버전 (1: '외출' 활동 제거, 2: 추위·더위 민감도로 교체) */
const PROFILE_STORE_VERSION = 2;

/** 사용자 프로필 스토어 (localStorage 저장) */
export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      hasOnboarded: false,
      // 프로필을 저장하면 온보딩도 완료된 것으로 본다
      saveProfile: (profile) => set({ profile, hasOnboarded: true }),
      setLastActivity: (activity) =>
        set((state) => ({ profile: { ...state.profile, lastActivity: activity } })),
    }),
    {
      name: 'run-smart-profile',
      version: PROFILE_STORE_VERSION,
      migrate: (persisted, version) => migrateProfileState(persisted, version) as ProfileState,
    },
  ),
);
