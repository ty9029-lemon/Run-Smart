import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Activity, Profile } from '../types';

/** 기본 프로필: 러닝만 선택, 보정값 0 */
export const DEFAULT_PROFILE: Profile = {
  selectedActivities: ['running'],
  lastActivity: 'running',
  offsets: { running: 0, hiking: 0, walking: 0, cycling: 0, outing: 0 },
  constraints: [],
};

interface ProfileState {
  profile: Profile;
  /** 첫 진입 입력(온보딩)을 마쳤는지 여부 */
  hasOnboarded: boolean;
  saveProfile: (profile: Profile) => void;
  setLastActivity: (activity: Activity) => void;
}

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
    { name: 'run-smart-profile' },
  ),
);
