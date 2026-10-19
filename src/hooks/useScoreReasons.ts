import { useCallback, useMemo, useState } from 'react';
import { SCORE_TOP_FACTOR_NONE } from '../constants/analytics';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import { calcScoreBreakdown } from '../lib/runScore';
import { buildScoreReasons, pickTopReasons, type ScoreReason } from '../lib/scoreReasons';
import type { Activity, Constraint, Sensitivity, Weather } from '../types';

interface ScoreReasonsState {
  reasons: ScoreReason[];
  sheetOpen: boolean;
  /** 시트를 열고 이벤트를 보낸다 */
  openSheet: () => void;
  setSheetOpen: (open: boolean) => void;
}

/**
 * 지금 날씨의 항목별 점수 근거와 근거 시트의 열림 상태를 관리한다.
 * @param weather 지금 날씨
 * @param sensitivity 추위·더위 민감도
 * @param constraints 제약사항
 * @param activity 활동
 * @param score 화면에 보이는 총점 (이벤트 속성)
 */
export function useScoreReasons(
  weather: Weather,
  sensitivity: Sensitivity,
  constraints: Constraint[],
  activity: Activity,
  score: number,
): ScoreReasonsState {
  const [sheetOpen, setSheetOpen] = useState(false);
  const reasons = useMemo(
    () =>
      buildScoreReasons(
        calcScoreBreakdown(weather, sensitivity, constraints, activity),
        activity,
        constraints,
        weather,
      ),
    [weather, sensitivity, constraints, activity],
  );

  const openSheet = useCallback(() => {
    const topFactor = pickTopReasons(reasons)[0]?.key ?? SCORE_TOP_FACTOR_NONE;
    trackEvent(ANALYTICS_EVENTS.scoreReasonSheetOpened, { activity, score, topFactor });
    setSheetOpen(true);
  }, [reasons, activity, score]);

  return { reasons, sheetOpen, openSheet, setSheetOpen };
}
