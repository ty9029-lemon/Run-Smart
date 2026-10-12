import { useCallback, useEffect, useRef, useState } from 'react';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import {
  INITIAL_REVIEW_STATE,
  loadReviewState,
  markSessionShown,
  planAppReview,
  resolveSession,
  saveReviewState,
  touchLastActive,
  type ReviewSession,
  type ReviewState,
} from '../lib/appReview';
import { insertAppReview } from '../lib/appReviewRepo';

interface UseAppReviewParams {
  /** 출발 기록 수 */
  entryCount: number;
  /** 토스트·체감 카드처럼 팝업보다 먼저 보여줄 안내가 떠 있는지 */
  isBlocked: boolean;
}

/** 훅이 돌려주는 값 */
export interface UseAppReviewResult {
  /** 팝업이 열려 있는지 */
  open: boolean;
  /** 응답을 보낸다. 저장에 성공하면 true, 실패하면 false (팝업은 열린 채 유지) */
  submit: (rating: number, message: string) => Promise<boolean>;
  /** 응답 없이 닫는다. */
  dismiss: () => void;
}

/** 두 값이 내용상 같은지 비교한다. (불필요한 리렌더와 타이머 재시작을 피하기 위함) */
function isSameValue<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** 세션 판정과 저장된 상태를 읽고, 탭에 돌아올 때마다 다시 확인한다. */
function useReviewSession() {
  const [session, setSession] = useState<ReviewSession | null>(null);
  const [state, setState] = useState<ReviewState>(INITIAL_REVIEW_STATE);

  useEffect(() => {
    /** 세션을 재판정하고 저장된 상태를 다시 읽는다. */
    const refresh = () => {
      const nextSession = resolveSession(Date.now());
      const nextState = loadReviewState();
      setSession((prev) => (prev && isSameValue(prev, nextSession) ? prev : nextSession));
      setState((prev) => (isSameValue(prev, nextState) ? prev : nextState));
    };
    /** 탭이 보이면 재판정하고, 숨겨질 때는 마지막 활동 시각을 남긴다. */
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
      else touchLastActive(Date.now());
    };
    refresh();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', refresh);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  return { session, setSession, state, setState };
}

/**
 * 재방문한 사용자에게 앱 만족도 팝업을 띄울지 관리한다.
 * 다른 안내에 막혀 있으면 이번 세션 안에서 끝난 뒤 지연해 띄우고, 끝내 못 띄우면 다음 세션으로 이월한다.
 */
export function useAppReview({ entryCount, isBlocked }: UseAppReviewParams): UseAppReviewResult {
  const { session, setSession, state, setState } = useReviewSession();
  const [open, setOpen] = useState(false);
  const wasBlockedRef = useRef(false);

  /** 상태를 저장소와 화면 상태에 함께 반영한다. */
  const persist = useCallback(
    (next: ReviewState) => {
      saveReviewState(next);
      setState(next);
    },
    [setState],
  );

  useEffect(() => {
    if (!session || open) return undefined;
    const input = { entryCount, state, session, now: Date.now() };
    const plan = planAppReview(input, isBlocked, wasBlockedRef.current);
    if (isBlocked) wasBlockedRef.current = true;
    if (plan.action === 'markPending') persist({ ...state, reviewPending: true });
    if (plan.action !== 'show') return undefined;
    const timer = setTimeout(() => {
      setSession(markSessionShown(session));
      persist({ ...state, reviewPending: false });
      setOpen(true);
      trackEvent(ANALYTICS_EVENTS.appReviewShown, { entryCount });
    }, plan.delayMs);
    return () => clearTimeout(timer);
  }, [session, state, entryCount, isBlocked, open, persist, setSession]);

  const submit = useCallback(
    async (rating: number, message: string): Promise<boolean> => {
      const saved = await insertAppReview({ rating, message, entryCount });
      if (!saved) return false;
      persist({ ...state, submitted: true, reviewPending: false });
      setOpen(false);
      trackEvent(ANALYTICS_EVENTS.appReviewSubmitted, {
        rating,
        hasMessage: message.trim() !== '',
        entryCount,
      });
      return true;
    },
    [entryCount, state, persist],
  );

  const dismiss = useCallback(() => {
    const dismissCount = state.dismissCount + 1;
    persist({ ...state, dismissCount, lastDismissedAt: Date.now() });
    setOpen(false);
    trackEvent(ANALYTICS_EVENTS.appReviewDismissed, { dismissCount });
  }, [state, persist]);

  return { open, submit, dismiss };
}
