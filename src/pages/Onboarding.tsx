import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import OnboardingStep from '../components/OnboardingStep';
import StepIndicator from '../components/StepIndicator';
import { CTA_IDS } from '../constants/analytics';
import { ONBOARDING_STEPS } from '../constants/onboarding';
import { useProfileDraft } from '../hooks/useProfileDraft';
import { requestLocationPermission } from '../hooks/useLocationPermission';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import { DEFAULT_PROFILE } from '../store/profileStore';
import type { Profile } from '../types';

/** 온보딩 시작값: 활동은 직접 고르도록 비워 둔다. */
const ONBOARDING_INITIAL: Profile = {
  ...DEFAULT_PROFILE,
  selectedActivities: [],
  lastActivity: null,
};

const LAST_STEP = ONBOARDING_STEPS.length - 1;

/** 첫 진입 온보딩: 활동 → 체감 임계치 → 제약사항 → 위치 순서로 진행 */
export default function Onboarding() {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const { draft, error, onChange, validate, submit } = useProfileDraft(
    ONBOARDING_INITIAL,
    (saved) => {
      trackEvent(ANALYTICS_EVENTS.onboardingCompleted, {
        activityCount: saved.selectedActivities.length,
        constraintCount: saved.constraints.length,
        useCurrentLocation: saved.useCurrentLocation,
      });
      navigate('/', { replace: true });
    },
  );
  const step = ONBOARDING_STEPS[stepIndex];
  const isLast = stepIndex === LAST_STEP;

  /**
   * 마지막 단계의 [시작하기] 클릭을 기록한다.
   * 현재 위치 사용이 켜져 있으면 권한 팝업을 띄운 뒤(거부돼도 계속 진행) 프로필을 저장한다.
   */
  const handleStart = async () => {
    setIsStarting(true);
    trackEvent(ANALYTICS_EVENTS.ctaClicked, { cta: CTA_IDS.onboardingStart });
    if (draft.useCurrentLocation) {
      trackEvent(ANALYTICS_EVENTS.ctaClicked, { cta: CTA_IDS.locationAllow });
      await requestLocationPermission();
    }
    submit();
    setIsStarting(false);
  };

  /** 다음 단계로. 활동 선택 단계는 1개 이상 골라야 넘어간다. */
  const handleNext = () => {
    if (step.id === 'activity' && !validate()) return;
    setStepIndex((i) => i + 1);
  };

  return (
    <main className="mx-auto max-w-md space-y-6 px-4 py-6">
      <StepIndicator current={stepIndex} total={ONBOARDING_STEPS.length} />
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{step.title}</h1>
        <p className="text-sm text-muted-foreground">{step.description}</p>
      </header>
      <section className="rounded-panel border border-border bg-card p-6">
        <OnboardingStep step={step.id} draft={draft} error={error} onChange={onChange} />
      </section>
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          disabled={stepIndex === 0}
          onClick={() => setStepIndex((i) => i - 1)}
          className="disabled:invisible"
        >
          이전
        </Button>
        <Button
          type="button"
          size="lg"
          disabled={isStarting}
          onClick={isLast ? handleStart : handleNext}
        >
          {isLast ? '시작하기' : '다음'}
        </Button>
      </div>
    </main>
  );
}
