import { useMemo } from 'react';
import { calcScoreBreakdown } from '../lib/runScore';
import { buildScoreDeltas, type ScoreDelta } from '../lib/scoreReasons';
import type { Activity, Constraint, Sensitivity, Weather } from '../types';

/**
 * 선택한 시각의 항목별 점수를 지금과 비교한다.
 * @param selected 선택한 시각의 날씨 (없거나 지금 시각이면 null → 비교하지 않는다)
 * @param current 지금 날씨
 * @param sensitivity 추위·더위 민감도
 * @param constraints 제약사항
 * @param activity 활동
 */
export function useHourScoreDeltas(
  selected: Weather | null,
  current: Weather,
  sensitivity: Sensitivity,
  constraints: Constraint[],
  activity: Activity,
): ScoreDelta[] | null {
  return useMemo(() => {
    if (!selected) return null;
    const base = calcScoreBreakdown(current, sensitivity, constraints, activity);
    const target = calcScoreBreakdown(selected, sensitivity, constraints, activity);
    return buildScoreDeltas(target, base);
  }, [selected, current, sensitivity, constraints, activity]);
}
