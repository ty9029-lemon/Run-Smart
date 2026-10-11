import { groupOutfitByCategory } from '../lib/outfit';
import type { OutfitItem } from '../types';
import OutfitIcon from './outfit/OutfitIcon';

interface OutfitPanelProps {
  items: OutfitItem[];
  /** 영역 제목 (기본: 오늘 추천 복장) */
  title?: string;
}

/** 복장 추천 영역 (3D 메탈릭 일러스트, 분류 순서대로 이어 붙인 3열 그리드) */
export default function OutfitPanel({ items, title = '오늘 추천 복장' }: OutfitPanelProps) {
  const orderedItems = groupOutfitByCategory(items).flatMap((group) => group.items);
  return (
    <section className="rounded-panel border border-card-border-ink bg-card-charcoal p-6">
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
