import { Button } from '@/components/ui/button';
import { formatDepartedNotice, MESSAGES } from '../constants/messages';

interface DecisionButtonsProps {
  /** 오늘 이 활동으로 이미 출발을 기록했는지 */
  departed: boolean;
  /** 안내 문구에 들어갈 활동명 */
  activityLabel: string;
  onDecide: () => void;
  onCancel: () => void;
}

/** [이대로 출발하기] 단일 CTA. 출발을 기록한 뒤에는 안내 문구와 [출발 취소]를 보여준다. */
export default function DecisionButtons({
  departed,
  activityLabel,
  onDecide,
  onCancel,
}: DecisionButtonsProps) {
  if (departed) {
    return (
      <div className="flex flex-col items-center gap-1 py-2">
        <p className="text-base font-medium text-pure-white" role="status">
          {formatDepartedNotice(activityLabel)}
        </p>
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={onCancel}
          className="text-steel-border"
        >
          {MESSAGES.departureCancel}
        </Button>
      </div>
    );
  }
  return (
    <Button type="button" variant="default" size="lg" onClick={onDecide} className="w-full">
      이대로 출발하기
    </Button>
  );
}
