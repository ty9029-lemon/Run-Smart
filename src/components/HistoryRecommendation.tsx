import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { OUTFIT_SOURCES } from '../constants/analytics';
import { HISTORY_MESSAGES } from '../constants/messages';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import type { HistoryEntry } from '../types';
import GuideBox from './GuideBox';
import OutfitPanel from './OutfitPanel';

interface HistoryRecommendationProps {
  entry: HistoryEntry;
  /** 기록 날짜가 오늘로부터 며칠 전인지 (열람 이벤트 속성) */
  daysAgo: number;
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
      <summary className="flex cursor-pointer list-none items-center gap-1 px-1 py-2 text-sm text-subtle-text [&::-webkit-details-marker]:hidden">
        {HISTORY_MESSAGES.recommendation}
        <ChevronDown
          aria-hidden="true"
          className="size-4 transition-transform group-open:rotate-180"
        />
      </summary>
      {open && (
        <div className="space-y-2 pt-1">
          <GuideBox
            guide={{ state: 'ready', data: entry.guide }}
            rawWeather={entry.weatherSummary}
          />
          {entry.outfit && entry.outfit.length > 0 && (
            <OutfitPanel
              items={entry.outfit}
              title="추천 복장"
              source={OUTFIT_SOURCES.history}
              activity={entry.activity}
            />
          )}
        </div>
      )}
    </details>
  );
}
