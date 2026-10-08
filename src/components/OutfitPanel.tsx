import { groupOutfitByCategory } from '../lib/outfit';
import type { OutfitItem } from '../types';

interface OutfitPanelProps {
  items: OutfitItem[];
}

/** 복장 추천 영역 (M1은 이모지, 분류 순서대로 이어 붙인 3열 그리드) */
export default function OutfitPanel({ items }: OutfitPanelProps) {
  const orderedItems = groupOutfitByCategory(items).flatMap((group) => group.items);
  return (
    <section className="rounded-panel border border-card-border-ink bg-card-charcoal p-6">
      <h2 className="mb-3 text-base font-bold">오늘의 복장</h2>
      <ul className="grid grid-cols-3 gap-4">
        {orderedItems.map((item) => (
          <li
            key={item.label}
            className="flex flex-col items-center gap-2 rounded-2xl border border-card-border-ink px-1 py-4 text-center"
          >
            <span className="text-5xl leading-none" aria-hidden="true">
              {item.emoji}
            </span>
            <span className="text-xs leading-tight">{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
