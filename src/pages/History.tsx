import { useEffect, useMemo, useState } from 'react';
import GuideBox from '../components/GuideBox';
import HistoryCalendar from '../components/HistoryCalendar';
import HistoryEntryStatus from '../components/HistoryEntryStatus';
import OutfitPanel from '../components/OutfitPanel';
import { getActivityMeta } from '../constants/activities';
import { OUTFIT_SOURCES } from '../constants/analytics';
import { MESSAGES } from '../constants/messages';
import { MS_PER_DAY } from '../constants/thresholds';
import { useActiveSession } from '../hooks/useActiveSession';
import { useNow } from '../hooks/useNow';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import { formatDistanceKm } from '../lib/distance';
import { isFeedbackAskable } from '../lib/feedback';
import { dayKey, groupEntriesByDay, type YearMonth } from '../lib/historyCalendar';
import { useHistoryStore } from '../store/historyStore';
import type { HistoryEntry } from '../types';

/** 날짜 표기 (예: 10월 5일 (월)) */
function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

/** 기록 날짜가 오늘로부터 며칠 전인지 (오늘이면 0) */
function daysAgoOf(iso: string): number {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = startOfDay(new Date()).getTime() - startOfDay(new Date(iso)).getTime();
  return Math.round(diff / MS_PER_DAY);
}

/** 기록 카드 상단 (시작 시각·활동 시간, 활동, 날씨 요약, 체감 피드백) */
function HistoryHeader({ entry }: { entry: HistoryEntry }) {
  const meta = getActivityMeta(entry.activity);
  const session = useActiveSession();
  const now = useNow();
  const runningStartedAt = session?.entryId === entry.id ? session.startedAt : null;
  const askFeedback = isFeedbackAskable(entry, now.getTime(), session?.entryId ?? null);
  return (
    <div className="rounded-panel border border-card-border-ink bg-card-charcoal p-6">
      <HistoryEntryStatus
        entry={entry}
        runningStartedAt={runningStartedAt}
        askFeedback={askFeedback}
      />
      <p className="mt-3 text-base font-medium">
        {meta.emoji} {meta.label}
      </p>
      <p className="text-sm text-steel-border">{entry.weatherSummary}</p>
      {entry.distanceKm !== undefined && (
        <p className="mt-1 text-sm">
          <span className="text-muted-foreground">거리 </span>
          <span className="font-medium">{formatDistanceKm(entry.distanceKm)}</span>
        </p>
      )}
      {entry.actualOutfit && (
        <p className="mt-1 text-sm">
          <span className="text-muted-foreground">실제 복장 </span>
          <span className="font-medium">{entry.actualOutfit}</span>
        </p>
      )}
    </div>
  );
}

/** 히스토리 한 건 (날씨 가이드와 추천 복장을 처음부터 모두 보여준다) */
function HistoryItem({ entry }: { entry: HistoryEntry }) {
  // 날짜를 선택해 카드가 보일 때 열람 이벤트를 한 번 보낸다.
  useEffect(() => {
    trackEvent(ANALYTICS_EVENTS.historyEntryViewed, {
      daysAgo: daysAgoOf(entry.date),
      decision: entry.decision,
      activity: entry.activity,
    });
  }, [entry.date, entry.decision, entry.activity]);

  return (
    <li className="space-y-2">
      <HistoryHeader entry={entry} />
      <GuideBox guide={{ state: 'ready', data: entry.guide }} rawWeather={entry.weatherSummary} />
      {entry.outfit && entry.outfit.length > 0 && (
        <OutfitPanel
          items={entry.outfit}
          title="추천 복장"
          source={OUTFIT_SOURCES.history}
          activity={entry.activity}
        />
      )}
    </li>
  );
}

/** 선택한 날의 기록 패널 */
function DayPanel({ date, entries }: { date: Date; entries: HistoryEntry[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-bold">{formatDate(date)}</h2>
      {entries.length === 0 ? (
        <p className="text-sm text-steel-border">{MESSAGES.historyEmptyDay}</p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            // 날짜가 바뀌면 카드를 새로 그려 열람 이벤트가 다시 전송되도록 key에 날짜를 섞는다.
            <HistoryItem key={`${dayKey(date)}-${entry.id}`} entry={entry} />
          ))}
        </ul>
      )}
    </section>
  );
}

/** 활동 히스토리 (월 단위 달력 + 선택한 날의 기록) */
export default function History() {
  const entries = useHistoryStore((s) => s.entries);
  const [today] = useState(() => new Date());
  const [selected, setSelected] = useState(today);
  const [viewMonth, setViewMonth] = useState<YearMonth>({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const entriesByDay = useMemo(() => groupEntriesByDay(entries), [entries]);

  return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-6">
      <header>
        <h1 className="text-2xl font-bold">활동 기록</h1>
      </header>
      <HistoryCalendar
        viewMonth={viewMonth}
        selected={selected}
        today={today}
        entriesByDay={entriesByDay}
        onSelect={setSelected}
        onChangeMonth={setViewMonth}
      />
      <DayPanel date={selected} entries={entriesByDay.get(dayKey(selected)) ?? []} />
    </main>
  );
}
