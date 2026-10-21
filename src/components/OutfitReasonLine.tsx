import type { OutfitReason } from '../lib/outfitReasons';

interface OutfitReasonLineProps {
  reason: OutfitReason;
}

/** 복장을 왜 이렇게 추천했는지 보여준다. (기본 근거 한 문장 + 조건 때문에 더해진 장비를 조건마다 한 문장씩) */
export default function OutfitReasonLine({ reason }: OutfitReasonLineProps) {
  return (
    <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm text-muted-foreground">
      <p>{reason.base}</p>
      {reason.extras.map((extra) => (
        <p key={extra}>{extra}</p>
      ))}
    </div>
  );
}
