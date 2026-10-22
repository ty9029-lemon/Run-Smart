import { useRef } from 'react';
import { SECTION_IDS, type OutfitSource } from '../constants/analytics';
import { useSectionViewed } from '../hooks/useSectionViewed';
import type { OutfitReason } from '../lib/outfitReasons';

interface OutfitReasonLineProps {
  reason: OutfitReason;
  /** 어느 화면의 복장 패널인지 (노출 이벤트 속성) */
  source: OutfitSource;
}

/** 복장을 왜 이렇게 추천했는지 보여준다. 기본 근거와 조건 때문에 더해진 장비 문장을 줄바꿈 없이 한 문단으로 이어 쓴다. */
export default function OutfitReasonLine({ reason, source }: OutfitReasonLineProps) {
  const lineRef = useRef<HTMLDivElement>(null);
  useSectionViewed(lineRef, SECTION_IDS.outfitReason, { screen: source });
  return (
    <div ref={lineRef} className="mt-4 border-t border-border pt-3 text-sm text-muted-foreground">
      <p>{[reason.base, ...reason.extras].join(' ')}</p>
    </div>
  );
}
