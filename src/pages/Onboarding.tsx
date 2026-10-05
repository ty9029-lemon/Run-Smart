import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingStep from '../components/OnboardingStep';
import StepIndicator from '../components/StepIndicator';
import { ONBOARDING_STEPS } from '../constants/onboarding';
import { useProfileDraft } from '../hooks/useProfileDraft';
import { DEFAULT_PROFILE } from '../store/profileStore';
import type { Profile } from '../types';

/** 온보딩 시작값: 활동은 직접 고르도록 비워 둔다. */
const ONBOARDING_INITIAL: Profile = {
  ...DEFAULT_PROFILE,
  selectedActivities: [],
  lastActivity: null,
};

const LAST_STEP = ONBOARDING_STEPS.length - 1;
const BUTTON = 'rounded-full border px-5 py-4 text-base font-medium';

/** 첫 진입 온보딩: 활동 → 체감 임계치 → 제약사항 → 위치 순서로 진행 */
export default function Onboarding() {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const { draft, error, onChange, validate, submit } = useProfileDraft(
    ONBOARDING_INITIAL,
    () => navigate('/', { replace: true }),
  );
  const step = ONBOARDING_STEPS[stepIndex];
  const isLast = stepIndex === LAST_STEP;

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
        <p className="text-sm text-steel-border">{step.description}</p>
      </header>
      <section className="rounded-panel border border-card-border-ink bg-card-charcoal p-6">
        <OnboardingStep step={step.id} draft={draft} error={error} onChange={onChange} />
      </section>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={stepIndex === 0}
          onClick={() => setStepIndex((i) => i - 1)}
          className={`${BUTTON} border-steel-border text-pure-white disabled:invisible`}
        >
          이전
        </button>
        <button
          type="button"
          onClick={isLast ? submit : handleNext}
          className={`${BUTTON} border-lime-pulse bg-lime-pulse text-carbon-black`}
        >
          {isLast ? '시작하기' : '다음'}
        </button>
      </div>
    </main>
  );
}
