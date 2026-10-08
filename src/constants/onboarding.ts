/** 온보딩 단계 id */
export type OnboardingStepId = 'activity' | 'offset' | 'constraint' | 'location';

/** 온보딩 단계 정보 */
export interface OnboardingStepMeta {
  id: OnboardingStepId;
  title: string;
  description: string;
}

/** 온보딩 4단계 (순서대로 진행) */
export const ONBOARDING_STEPS: OnboardingStepMeta[] = [
  {
    id: 'activity',
    title: '어떤 활동을 하세요?',
    description: '자주 하는 활동을 골라 주세요.',
  },
  {
    id: 'offset',
    title: '추위·더위를 얼마나 타세요?',
    description: '해당하는 정도를 골라 주세요.',
  },
  {
    id: 'constraint',
    title: '신경 쓸 점이 있나요?',
    description: '해당하는 항목을 모두 체크해 주세요. 없으면 건너뛰어도 돼요.',
  },
  {
    id: 'location',
    title: '위치를 알려주세요',
    description: '현재 위치 기준으로 날씨를 보여드려요. 허용하지 않으면 서울 기준으로 보여드려요.',
  },
];
