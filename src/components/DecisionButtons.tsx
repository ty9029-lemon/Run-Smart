import { MESSAGES } from '../constants/messages';
import type { Decision } from '../types';

interface DecisionButtonsProps {
  decision: Decision | null;
  /** 기록 직후라 버튼 대신 피드백과 '취소하기'만 보여줄지 여부 */
  locked: boolean;
  onDecide: (decision: Decision) => void;
  onCancel: () => void;
}

/** 결정 결과 문구 */
const DECISION_MESSAGE: Record<Decision, string> = {
  go: MESSAGES.decisionGo,
  skip: MESSAGES.decisionSkip,
};

/** 기록 직후 보여주는 피드백과 [취소하기] 버튼 */
function DecisionFeedback({
  decision,
  onCancel,
}: {
  decision: Decision;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <p className="text-base font-medium text-pure-white" role="status">
        {DECISION_MESSAGE[decision]}
      </p>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-full border border-steel-border px-5 py-3 text-sm font-medium text-pure-white"
      >
        {MESSAGES.decisionCancel}
      </button>
    </div>
  );
}

/** [가기 / 안 가기] 빠른 응답 버튼. 기록 직후에는 피드백과 [취소하기]로 바뀐다. */
export default function DecisionButtons({
  decision,
  locked,
  onDecide,
  onCancel,
}: DecisionButtonsProps) {
  if (decision && locked) {
    return <DecisionFeedback decision={decision} onCancel={onCancel} />;
  }
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onDecide('go')}
          className={`rounded-full border border-lime-pulse px-5 py-4 text-base font-medium ${
            decision === 'go' ? 'bg-lime-pulse text-carbon-black' : 'text-lime-pulse'
          }`}
        >
          가기
        </button>
        <button
          type="button"
          onClick={() => onDecide('skip')}
          className={`rounded-full border border-steel-border px-5 py-4 text-base font-medium ${
            decision === 'skip' ? 'bg-pure-white text-carbon-black' : 'text-pure-white'
          }`}
        >
          안 가기
        </button>
      </div>
      {decision && (
        <p className="mt-2 text-center text-sm text-steel-border" role="status">
          {DECISION_MESSAGE[decision]}
        </p>
      )}
    </div>
  );
}
