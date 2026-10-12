import { useRef } from 'react';
import {
  OUTFIT_VIEW_DWELL_MS,
  OUTFIT_VIEW_RATIO,
  type OutfitSource,
} from '../constants/analytics';
import { useViewedOnce } from '../hooks/useViewedOnce';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import { groupOutfitByCategory } from '../lib/outfit';
import type { Activity, OutfitItem } from '../types';
import OutfitIcon from './outfit/OutfitIcon';

interface OutfitPanelProps {
  items: OutfitItem[];
  /** 영역 제목 (기본: 오늘 추천 복장) */
  title?: string;
  /** 어느 화면에서 보여주는지 (노출 이벤트 구분용) */
  source: OutfitSource;
  /** 복장이 추천된 활동 (노출 이벤트 속성) */
  activity: Activity;
}

/** 복장 추천 영역 (3D 메탈릭 일러스트, 분류 순서대로 이어 붙인 3열 그리드) */
export default function OutfitPanel({
  items,
  title = '오늘 추천 복장',
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
      className="rounded-panel border border-card-border-ink bg-card-charcoal p-6"
    >
      <h2 className="mb-3 text-base font-bold">{title}</h2>
      <ul className="grid grid-cols-3 gap-4">
        {orderedItems.map((item) => (
          <li
            key={item.label}
            className="flex flex-col items-center gap-2 rounded-2xl border border-card-border-ink px-1 py-4 text-center"
          >
            <OutfitIcon icon={item.icon} className="size-16" />
            <span className="text-xs leading-tight">{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
