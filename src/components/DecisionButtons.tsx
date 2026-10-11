import { Button } from '@/components/ui/button';

interface DecisionButtonsProps {
  onDecide: () => void;
}

/** [이대로 출발하기] 단일 CTA 버튼. 기록 결과는 토스트로 안내한다. */
export default function DecisionButtons({ onDecide }: DecisionButtonsProps) {
  return (
    <Button type="button" variant="default" size="lg" onClick={onDecide} className="w-full">
      이대로 출발하기
    </Button>
  );
}
