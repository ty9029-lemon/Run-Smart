import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ActivityTimePicker from '../components/ActivityTimePicker';
import OnboardingStep from '../components/OnboardingStep';
import StepIndicator from '../components/StepIndicator';
import { CTA_IDS } from '../constants/analytics';
import { MOTION_DURATION_MS } from '../constants/motion';
import { ONBOARDING_STEPS } from '../constants/onboarding';
import { useAppRevealed } from '../hooks/useAppRevealed';
import { useProfileDraft } from '../hooks/useProfileDraft';
import { useRestoreFocus } from '../hooks/useRestoreFocus';
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

/**
 * 모바일: 하단에 고정된 [이전]/[다음]에 본문이 가리지 않도록 비워 두는 아래 여백
 * (버튼 48px + 위 그라데이션 24px + 아래 여백 12px + 기기 하단 safe-area). 넓은 화면(md~)은 버튼이 본문 아래에 이어지므로 일반 여백(24px)이다.
 * Tailwind가 읽을 수 있게 클래스 문자열 전체를 적는다.
 */
const MAIN_BOTTOM_CLASS = 'pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-6';

/**
 * [이전]/[다음] 영역.
 * 모바일은 단계마다 콘텐츠 높이가 달라도 같은 자리에 있도록 화면 하단에 고정한다(홈의 CTA와 같은 그라데이션 바탕, 아래 여백 12px + safe-area).
 * 넓은 화면(md~)은 내용이 짧을 때 버튼이 멀리 떨어져 보이므로 본문 아래에 이어 붙인다(위 여백 48px, 부모 space-y의 여백보다 우선하도록 `!`를 쓴다).
 */
const CTA_BAR_CLASS =
  'fixed inset-x-0 bottom-0 z-30 bg-linear-to-t from-background from-70% to-transparent px-4 pt-6 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:static md:mt-12! md:bg-none md:p-0';

/** 온보딩을 마치고 홈으로 넘어가기 직전, 화면이 사라지는 전환 */
const LEAVE_FADE_CLASS =
  'opacity-0 transition-opacity duration-(--motion-duration-fast) ease-(--motion-ease-exit)';

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
  // [시작하기] 뒤 홈으로 넘어가기 전에 화면이 짧게 사라지는 중인지
  const [isLeaving, setIsLeaving] = useState(false);
  // 버튼은 단계가 바뀌어도 다시 그리지 않고 같은 자리에 둔다(포커스 유지).
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
  // 눌렀던 버튼이 사라지는 전환(2단계의 [이전])에서 포커스를 잃지 않게 한다.
  useRestoreFocus(buttonsRef, stepIndex);

  /** 순차 등장: 요소 순서만큼 --motion-stagger 지연을 준다. */
  const getMotion = (index: number): StepMotion => ({
    className: isRevealed ? STEP_MOTION_CLASS[direction] : '',
    style: { animationDelay: `calc(${index} * var(--motion-stagger))` },
  });
  // 스플래시가 사라지기 전에는 숨기고, 시작하기를 누른 뒤에는 짧게 사라진다(나가는 모션은 exit 이징).
  const mainFadeClass = isLeaving ? LEAVE_FADE_CLASS : isRevealed ? '' : 'opacity-0';

  /**
   * 마지막 단계의 [시작하기] 클릭을 기록한다.
   * 현재 위치 사용이 켜져 있으면 권한 팝업을 띄운 뒤(거부돼도 계속 진행) 화면을 짧게 사라지게 하고 프로필을 저장한다.
   * 저장하면 곧바로 홈으로 이동하므로, 사라지는 모션은 저장 전에 끝낸다.
   */
  const handleStart = async () => {
    setIsStarting(true);
    trackEvent(ANALYTICS_EVENTS.ctaClicked, { cta: CTA_IDS.onboardingStart });
    if (draft.useCurrentLocation) {
      trackEvent(ANALYTICS_EVENTS.ctaClicked, { cta: CTA_IDS.locationAllow });
      await requestLocationPermission();
    }
    if (!validate()) {
      setIsStarting(false);
      return;
    }
    setIsLeaving(true);
    await new Promise((resolve) => setTimeout(resolve, MOTION_DURATION_MS.fast));
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
      className={`mx-auto max-w-md space-y-6 overflow-x-clip px-4 pt-6 ${MAIN_BOTTOM_CLASS} ${mainFadeClass}`}
    >
      <StepIndicator current={stepIndex} total={ONBOARDING_STEPS.length} stepTitle={step.title} />
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
      <div className={CTA_BAR_CLASS}>
        {/* 본문(max-w-md + px-4)과 같은 폭이 되도록 max-w-104를 쓴다 */}
        <div
          ref={buttonsRef}
          className={`mx-auto grid max-w-104 gap-3 ${isFirst ? '' : 'grid-cols-2'}`}
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
      </div>
    </main>
  );
}
