import { useEffect, useMemo, useState } from 'react';
import HistoryCalendar from '../components/HistoryCalendar';
import HistoryEntryMenu from '../components/HistoryEntryMenu';
import HistoryEntryStatus from '../components/HistoryEntryStatus';
import HistoryRecommendation from '../components/HistoryRecommendation';
import { chipVariants } from '@/components/ui/chip';
import { HISTORY_MESSAGES, MESSAGES } from '../constants/messages';
import { MS_PER_DAY } from '../constants/thresholds';
import { useActiveSession } from '../hooks/useActiveSession';
import { useNow } from '../hooks/useNow';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
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

/** 기록 카드 (시각·활동·체감·거리/페이스/시간, 날씨 요약, 실제 복장) */
function HistoryHeader({ entry }: { entry: HistoryEntry }) {
  const session = useActiveSession();
  const now = useNow();
  const runningStartedAt = session?.entryId === entry.id ? session.startedAt : null;
  const askFeedback = isFeedbackAskable(entry, now.getTime(), session?.entryId ?? null);
  return (
    <div className="relative rounded-panel bg-card p-6">
      {/* 진행 중인 기록은 수정·삭제하지 않는다 */}
      {runningStartedAt === null && (
        <div className="absolute right-3 top-3">
          <HistoryEntryMenu entry={entry} daysAgo={daysAgoOf(entry.date)} />
        </div>
      )}
      <HistoryEntryStatus
        entry={entry}
        runningStartedAt={runningStartedAt}
        askFeedback={askFeedback}
      />
      <div className="mt-5 space-y-1 text-base">
        <p>
          <span className="mr-2 text-muted-foreground">{HISTORY_MESSAGES.weatherLabel}</span>
          {entry.weatherSummary}
        </p>
        {entry.actualOutfit && (
          <p>
            <span className="mr-2 text-muted-foreground">{HISTORY_MESSAGES.actualOutfitLabel}</span>
            {entry.actualOutfit}
          </p>
        )}
      </div>
    </div>
  );
}

/** 히스토리 한 건 (기록 카드 + 접어 둔 그날의 추천) */
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
    <li className="space-y-1">
      <HistoryHeader entry={entry} />
      <HistoryRecommendation entry={entry} daysAgo={daysAgoOf(entry.date)} />
    </li>
  );
}

/** 선택한 날의 기록 패널 */
function DayPanel({ date, entries }: { date: Date; entries: HistoryEntry[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-bold">{formatDate(date)}</h2>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">{MESSAGES.historyEmptyDay}</p>
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

  /** 오늘 날짜와 이번 달로 돌아온다. */
  const goToday = () => {
    setSelected(today);
    setViewMonth({ year: today.getFullYear(), month: today.getMonth() });
  };

  return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">활동 기록</h1>
        <button type="button" className={chipVariants()} onClick={goToday}>
          {HISTORY_MESSAGES.today}
        </button>
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
