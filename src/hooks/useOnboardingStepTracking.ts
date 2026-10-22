import { useCallback, useEffect, useRef } from 'react';
import type { OnboardingStepId } from '../constants/onboarding';
import { MS_PER_SECOND } from '../constants/thresholds';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import type { StepDirection } from '../lib/stepDirection';

/**
 * 온보딩 단계 이벤트를 보낸다. 단계가 바뀔 때 onboarding_step_viewed를 보내고,
 * 반환된 함수를 호출하면 그 단계에 머문 시간과 함께 onboarding_step_completed를 보낸다.
 * @param step 현재 단계 id
 * @param stepIndex 현재 단계 순서 (0부터)
 * @param direction 이 단계로 온 방향 (다음 / 이전)
 * @returns 현재 단계를 마쳤다고 기록하는 함수
 */
export function useOnboardingStepTracking(
  step: OnboardingStepId,
  stepIndex: number,
  direction: StepDirection,
): () => void {
  const enteredAtRef = useRef(0);

  useEffect(() => {
    enteredAtRef.current = Date.now();
    trackEvent(ANALYTICS_EVENTS.onboardingStepViewed, {
      step,
      stepIndex,
      direction,
    });
  }, [step, stepIndex, direction]);

  return useCallback(() => {
    trackEvent(ANALYTICS_EVENTS.onboardingStepCompleted, {
      step,
      stepIndex,
      durationSec: Math.round((Date.now() - enteredAtRef.current) / MS_PER_SECOND),
    });
  }, [step, stepIndex]);
}
