import type { OutfitReason } from '../lib/outfitReasons';

interface OutfitReasonLineProps {
  reason: OutfitReason;
}

/** 복장을 왜 이렇게 추천했는지 보여준다. 기본 근거와 조건 때문에 더해진 장비 문장을 줄바꿈 없이 한 문단으로 이어 쓴다. */
export default function OutfitReasonLine({ reason }: OutfitReasonLineProps) {
  return (
    <div className="mt-4 border-t border-border pt-3 text-sm text-muted-foreground">
      <p>{[reason.base, ...reason.extras].join(' ')}</p>
    </div>
  );
}
