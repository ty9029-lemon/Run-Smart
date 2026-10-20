import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ActivityTimePicker from '../components/ActivityTimePicker';
import OnboardingStep from '../components/OnboardingStep';
import StepIndicator from '../components/StepIndicator';
import { CTA_IDS } from '../constants/analytics';
import { ONBOARDING_STEPS } from '../constants/onboarding';
import { useAppRevealed } from '../hooks/useAppRevealed';
import { useProfileDraft } from '../hooks/useProfileDraft';
import { useRestartAnimation } from '../hooks/useRestartAnimation';
import { requestLocationPermission, useLocationPermission } from '../hooks/useLocationPermission';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import { toggleActivityTimeSlot } from '../lib/profileDraft';
import { getStepDirection, type StepDirection } from '../lib/stepDirection';
import { DEFAULT_PROFILE } from '../store/profileStore';
import type { Profile } from '../types';

/** 온보딩 시작값: 활동은 직접 고르도록 비워 둔다. */
const ONBOARDING_INITIAL: Profile = {
  ...DEFAULT_PROFILE,
  selectedActivities: [],
  lastActivity: null,
};

const LAST_STEP = ONBOARDING_STEPS.length - 1;

/** 이어지는 질문 위 여백 (36px) */
const FOLLOW_UP_GAP_CLASS = 'mt-9';

/** 하단 버튼 위 여백 (48px) */
const BUTTON_GAP_CLASS = 'mt-12';

/** 단계 이동 방향별 등장 애니메이션 (모션 줄이기 설정에서는 적용하지 않는다) */
const STEP_MOTION_CLASS: Record<StepDirection, string> = {
  forward: 'motion-safe:animate-step-in-forward',
  back: 'motion-safe:animate-step-in-back',
};

/** 단계 요소 하나의 등장 모션 */
interface StepMotion {
  className: string;
  style: CSSProperties;
}

interface StepSectionProps {
  title: string;
  description: string;
  /** 단계의 첫 질문이면 페이지 제목(h1)으로 그린다 */
  isMain?: boolean;
  /** 요소 순서에 맞는 등장 모션 클래스·스타일을 돌려준다 */
  getMotion: (index: number) => StepMotion;
  /** 이 구역의 첫 요소가 화면 전체에서 몇 번째로 등장하는지 */
  startIndex?: number;
  children: ReactNode;
}

/** 질문 제목·설명과 입력 카드를 묶은 한 구역 */
function StepSection({
  title,
  description,
  isMain = false,
  getMotion,
  startIndex = 0,
  children,
}: StepSectionProps) {
  const Heading = isMain ? 'h1' : 'h2';
  const headerMotion = getMotion(startIndex);
  const cardMotion = getMotion(startIndex + 1);
  return (
    <>
      <header
        className={`space-y-1 ${isMain ? '' : FOLLOW_UP_GAP_CLASS} ${headerMotion.className}`}
        style={headerMotion.style}
      >
        <Heading className="text-2xl font-bold">{title}</Heading>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>
      <section
        className={`rounded-panel bg-card p-6 ${cardMotion.className}`}
        style={cardMotion.style}
      >
        {children}
      </section>
    </>
  );
}

/** 첫 진입 온보딩: 활동 → 체감 임계치 → 제약사항 → 위치 순서로 진행 */
export default function Onboarding() {
  const navigate = useNavigate();
  // 스플래시가 완전히 사라지기 전에는 화면을 숨기고 모션도 걸지 않는다. (사라지는 로고와 겹쳐 보이지 않도록)
  const isRevealed = useAppRevealed();
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<StepDirection>('forward');
  // 단계 콘텐츠를 키로 다시 그려도 구독이 초기화되지 않도록 여기서 한 번만 구독한다.
  const locationStatus = useLocationPermission();
  const [isStarting, setIsStarting] = useState(false);
  // 버튼은 다시 그리지 않고(포커스 유지) 단계가 바뀔 때 애니메이션만 다시 재생한다.
  const buttonsRef = useRef<HTMLDivElement>(null);
  const { draft, error, onChange, validate, submit } = useProfileDraft(
    ONBOARDING_INITIAL,
    (saved) => {
      trackEvent(ANALYTICS_EVENTS.onboardingCompleted, {
        activityCount: saved.selectedActivities.length,
        timeSlotCount: saved.activityTimeSlots.length,
        constraintCount: saved.constraints.length,
        useCurrentLocation: saved.useCurrentLocation,
      });
      navigate('/', { replace: true });
    },
  );
  const step = ONBOARDING_STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === LAST_STEP;
  useRestartAnimation(buttonsRef, stepIndex);

  /** 순차 등장: 요소 순서만큼 --motion-stagger 지연을 준다. */
  const getMotion = (index: number): StepMotion => ({
    className: isRevealed ? STEP_MOTION_CLASS[direction] : '',
    style: { animationDelay: `calc(${index} * var(--motion-stagger))` },
  });
  const buttonsMotion = getMotion(step.followUp ? 4 : 2);

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

  /** 1단계는 활동과 시간대를 모두 골라야 다음 버튼이 켜진다. */
  const isStepComplete =
    step.id !== 'activity' ||
    (draft.selectedActivities.length > 0 && draft.activityTimeSlots.length > 0);

  /** 단계를 옮기고, 등장 애니메이션 방향을 함께 정한다. */
  const goToStep = (next: number) => {
    setDirection(getStepDirection(stepIndex, next));
    setStepIndex(next);
  };

  /** 다음 단계로. 활동 선택 단계는 1개 이상 골라야 넘어간다. */
  const handleNext = () => {
    if (step.id === 'activity' && !validate()) return;
    goToStep(stepIndex + 1);
  };

  return (
    <main
      className={`mx-auto max-w-md space-y-6 overflow-x-clip px-4 py-6 ${isRevealed ? '' : 'opacity-0'}`}
    >
      <StepIndicator current={stepIndex} total={ONBOARDING_STEPS.length} />
      <div key={step.id} className="space-y-6">
        <StepSection
          title={step.title}
          description={step.description}
          isMain
          getMotion={getMotion}
        >
          <OnboardingStep
            step={step.id}
            draft={draft}
            error={error}
            locationStatus={locationStatus}
            onChange={onChange}
          />
        </StepSection>
        {step.followUp && (
          <StepSection
            title={step.followUp.title}
            description={step.followUp.description}
            getMotion={getMotion}
            startIndex={2}
          >
            <ActivityTimePicker
              selected={draft.activityTimeSlots}
              onToggle={(id) => onChange(toggleActivityTimeSlot(draft, id))}
            />
          </StepSection>
        )}
      </div>
      <div
        ref={buttonsRef}
        className={`grid gap-3 ${BUTTON_GAP_CLASS} ${isFirst ? '' : 'grid-cols-2'} ${buttonsMotion.className}`}
        style={buttonsMotion.style}
      >
        {!isFirst && (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => goToStep(stepIndex - 1)}
          >
            이전
          </Button>
        )}
        <Button
          type="button"
          size="lg"
          disabled={isStarting || !isStepComplete}
          onClick={isLast ? handleStart : handleNext}
        >
          {isLast ? '시작하기' : '다음'}
        </Button>
      </div>
    </main>
  );
}
