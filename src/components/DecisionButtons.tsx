import type { Decision } from '../types';

interface DecisionButtonsProps {
  decision: Decision | null;
  onDecide: (decision: Decision) => void;
}

/** [가기 / 안 가기] 빠른 응답 버튼 */
export default function DecisionButtons({ decision, onDecide }: DecisionButtonsProps) {
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
          {decision === 'go' ? '가기로 기록했어요.' : '안 가기로 기록했어요.'}
        </p>
      )}
    </div>
  );
}
