import { ChevronDown } from 'lucide-react';
import { useRef, useState } from 'react';
import {
  OUTFIT_SOURCES,
  OUTFIT_VIEW_DWELL_MS,
  OUTFIT_VIEW_RATIO,
} from '../constants/analytics';
import { HISTORY_MESSAGES } from '../constants/messages';
import { useViewedOnce } from '../hooks/useViewedOnce';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import { groupOutfitByCategory } from '../lib/outfit';
import type { HistoryEntry } from '../types';
import GuideBox from './GuideBox';
import OutfitIcon from './outfit/OutfitIcon';

interface HistoryRecommendationProps {
  entry: HistoryEntry;
  /** 기록 날짜가 오늘로부터 며칠 전인지 (열람 이벤트 속성) */
  daysAgo: number;
}

interface HistoryOutfitIconsProps {
  items: NonNullable<HistoryEntry['outfit']>;
  activity: HistoryEntry['activity'];
}

/**
 * 그날의 추천 복장을 이름 없이 작은 일러스트 한 줄로 보여준다.
 * 이름은 화면 읽기 프로그램용으로만 남기고, 보였을 때 한 번 노출 이벤트를 보낸다.
 */
function HistoryOutfitIcons({ items, activity }: HistoryOutfitIconsProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const orderedItems = groupOutfitByCategory(items).flatMap((group) => group.items);

  useViewedOnce(
    listRef,
    () =>
      trackEvent(ANALYTICS_EVENTS.outfitViewed, {
        source: OUTFIT_SOURCES.history,
        activity,
        itemCount: orderedItems.length,
      }),
    { ratio: OUTFIT_VIEW_RATIO, dwellMs: OUTFIT_VIEW_DWELL_MS },
  );

  return (
    <ul ref={listRef} aria-label="추천 복장" className="flex gap-4 pt-1">
      {orderedItems.map((item) => (
        <li key={item.label}>
          <OutfitIcon icon={item.icon} className="size-10" />
          <span className="sr-only">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

/** 그날의 AI 가이드와 추천 복장. 처음에는 접어 두고, 열 때 한 번씩 열람 이벤트를 보낸다. */
export default function HistoryRecommendation({ entry, daysAgo }: HistoryRecommendationProps) {
  const [open, setOpen] = useState(false);

  /** details가 열리거나 닫힐 때 상태를 맞추고, 열릴 때만 이벤트를 보낸다. */
  const handleToggle = (event: React.SyntheticEvent<HTMLDetailsElement>) => {
    const nextOpen = event.currentTarget.open;
    setOpen(nextOpen);
    if (nextOpen) {
      trackEvent(ANALYTICS_EVENTS.historyRecommendationOpened, {
        activity: entry.activity,
        daysAgo,
      });
    }
  };

  return (
    <details className="group" onToggle={handleToggle}>
      <summary className="flex cursor-pointer list-none items-center gap-1 px-1 py-2 text-sm text-muted-foreground [&::-webkit-details-marker]:hidden">
        {HISTORY_MESSAGES.recommendation}
        <ChevronDown
          aria-hidden="true"
          className="size-4 transition-transform duration-(--motion-duration-fast) ease-(--motion-ease-main) group-open:rotate-180"
        />
      </summary>
      {open && (
        <div className="pt-1">
          <GuideBox
            guide={{ state: 'ready', data: entry.guide }}
            rawWeather={entry.weatherSummary}
          >
            {entry.outfit && entry.outfit.length > 0 && (
              <HistoryOutfitIcons items={entry.outfit} activity={entry.activity} />
            )}
          </GuideBox>
        </div>
      )}
    </details>
  );
}
