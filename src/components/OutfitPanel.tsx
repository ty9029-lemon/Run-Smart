import type { OutfitItem } from '../types';

interface OutfitPanelProps {
  items: OutfitItem[];
}

/** 복장 추천 영역 (M1은 이모지, 한 줄 3등분 타일) */
export default function OutfitPanel({ items }: OutfitPanelProps) {
  return (
    <section className="rounded-panel border border-card-border-ink bg-card-charcoal p-6">
      <h2 className="mb-3 text-base font-bold">오늘의 복장</h2>
      <ul className="grid grid-cols-3 gap-4">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex flex-col items-center gap-2 rounded-md border border-card-border-ink px-1 py-4 text-center"
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
