import { useRef } from 'react';
import {
  OUTFIT_VIEW_DWELL_MS,
  OUTFIT_VIEW_RATIO,
  type OutfitSource,
} from '../constants/analytics';
import { useViewedOnce } from '../hooks/useViewedOnce';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import { groupOutfitByCategory } from '../lib/outfit';
import type { OutfitReason } from '../lib/outfitReasons';
import type { Activity, OutfitItem } from '../types';
import OutfitIcon from './outfit/OutfitIcon';
import OutfitReasonLine from './OutfitReasonLine';

interface OutfitPanelProps {
  items: OutfitItem[];
  /** 영역 제목 (기본: 오늘 추천 복장, null이면 제목 없이 보여준다) */
  title?: string | null;
  /** 복장을 왜 이렇게 추천했는지 (없으면 보여주지 않는다) */
  reason?: OutfitReason | null;
  /** 복장 아래에 불릿으로 보여줄 활동 팁 */
  tips?: string[];
  /** 어느 화면에서 보여주는지 (노출 이벤트 구분용) */
  source: OutfitSource;
  /** 복장이 추천된 활동 (노출 이벤트 속성) */
  activity: Activity;
}

/** 복장 추천 영역 (3D 메탈릭 일러스트, 분류 순서대로 이어 붙인 3열 그리드) */
export default function OutfitPanel({
  items,
  title = '오늘 추천 복장',
  reason = null,
  tips = [],
  source,
  activity,
}: OutfitPanelProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const orderedItems = groupOutfitByCategory(items).flatMap((group) => group.items);

  // 패널이 일정 비율·시간 이상 보였을 때 마운트당 한 번만 노출 이벤트를 보낸다
  useViewedOnce(
    sectionRef,
    () =>
      trackEvent(ANALYTICS_EVENTS.outfitViewed, {
        source,
        activity,
        itemCount: orderedItems.length,
      }),
    { ratio: OUTFIT_VIEW_RATIO, dwellMs: OUTFIT_VIEW_DWELL_MS },
  );

  return (
    <section
      ref={sectionRef}
      className="rounded-panel bg-card-charcoal px-6 py-5"
    >
      {title && <h2 className="mb-3 text-base font-bold">{title}</h2>}
      <ul className="grid grid-cols-3 gap-4">
        {orderedItems.map((item) => (
          <li
            key={item.label}
            className="flex flex-col items-center gap-2 rounded-2xl px-1 py-3 text-center"
          >
            <OutfitIcon icon={item.icon} className="size-16" />
            <span className="break-keep text-xs leading-tight">{item.label}</span>
          </li>
        ))}
      </ul>
      {reason && <OutfitReasonLine reason={reason} />}
      {tips.length > 0 && (
        <ul className="mt-4 list-disc space-y-0.5 pl-6 text-base">
          {tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
