import { Button } from '@/components/ui/button';
import { FEEDBACK_LABELS, FEEDBACK_MESSAGES, FEEDBACK_ORDER } from '../constants/feedback';
import type { Feedback } from '../types';

interface FeedbackChoicesProps {
  /** 선택지를 눌렀을 때 */
  onSelect: (feedback: Feedback) => void;
  /** '다음에 할게요'를 눌렀을 때. 없으면 버튼을 보여주지 않는다(기록 화면처럼 미룰 필요가 없을 때) */
  onLater?: () => void;
}

/** 체감 피드백 선택지(추웠어요/적당했어요/더웠어요)와 '다음에 할게요' 버튼. 카드와 시트가 함께 쓴다. */
export default function FeedbackChoices({ onSelect, onLater }: FeedbackChoicesProps) {
  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {FEEDBACK_ORDER.map((value) => (
          <Button
            key={value}
            type="button"
            variant="outline"
            onClick={() => onSelect(value)}
            className="px-3 text-sm"
          >
            {FEEDBACK_LABELS[value]}
          </Button>
        ))}
      </div>
      {onLater && (
        <button
          type="button"
          onClick={onLater}
          className="w-full text-center text-sm text-subtle-text"
        >
          {FEEDBACK_MESSAGES.later}
        </button>
      )}
    </>
  );
}
