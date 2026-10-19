import { SCORE_REASON_MESSAGES } from '../constants/scoreReasons';
import { pickTopReasons, type ScoreReason } from '../lib/scoreReasons';

interface ScoreReasonLineProps {
  reasons: ScoreReason[];
  /** "왜 이 점수예요?"를 눌렀을 때 */
  onOpenBreakdown: () => void;
}

/** 깎인 이유를 한 줄로 만든다. (예: "미세먼지 −9점 · 강수 −5점") */
function formatReasonText(top: ScoreReason[]): string {
  if (top.length === 0) return SCORE_REASON_MESSAGES.noPenalty;
  return top.map((r) => `${r.label} −${r.penalty}점`).join(' · ');
}

/** 점수 카드 안에서 점수가 깎인 이유를 한 줄로 알리고, 항목별 근거 시트를 여는 버튼을 둔다. */
export default function ScoreReasonLine({ reasons, onOpenBreakdown }: ScoreReasonLineProps) {
  const top = pickTopReasons(reasons);
  const hasSensitive = top.some((r) => r.sensitive);
  return (
    <div className="flex items-start justify-between gap-3 border-t border-card-border-ink pt-3">
      <div className="min-w-0 text-sm">
        <p className="font-medium">{formatReasonText(top)}</p>
        {hasSensitive && (
          <p className="mt-0.5 text-subtle-text">{SCORE_REASON_MESSAGES.sensitiveNote}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onOpenBreakdown}
        className="shrink-0 py-1 text-sm text-subtle-text underline underline-offset-4"
      >
        {SCORE_REASON_MESSAGES.openSheet}
      </button>
    </div>
  );
}
