import { useRef } from 'react';
import { ACTIVITY_SCREENS, SECTION_IDS } from '../constants/analytics';
import { SCORE_REASON_MESSAGES } from '../constants/scoreReasons';
import { useSectionViewed } from '../hooks/useSectionViewed';
import type { ScoreDelta } from '../lib/scoreReasons';

interface ScoreDeltaLineProps {
  deltas: ScoreDelta[];
}

/** 차이를 부호와 함께 쓴다. (예: +4점, −3점) */
function formatDiff(diff: number): string {
  return `${diff > 0 ? '+' : '−'}${Math.abs(diff)}점`;
}

/** 선택한 시각이 지금과 어떤 항목에서 달라지는지 한 줄로 알린다. (예: 지금보다 바람 +4점 · 미세먼지 −3점) */
export default function ScoreDeltaLine({ deltas }: ScoreDeltaLineProps) {
  const lineRef = useRef<HTMLParagraphElement>(null);
  useSectionViewed(lineRef, SECTION_IDS.scoreDelta, { screen: ACTIVITY_SCREENS.home });
  if (deltas.length === 0) {
    return (
      <p ref={lineRef} className="text-sm text-muted-foreground">{SCORE_REASON_MESSAGES.compareSame}</p>
    );
  }
  return (
    <p ref={lineRef} className="text-sm text-muted-foreground">
      {SCORE_REASON_MESSAGES.compareLead}{' '}
      {deltas.map((d, i) => (
        <span key={d.key}>
          {i > 0 && ' · '}
          {d.label}{' '}
          <span className={d.diff > 0 ? 'text-level-good' : 'text-level-bad'}>
            {formatDiff(d.diff)}
          </span>
        </span>
      ))}
    </p>
  );
}
