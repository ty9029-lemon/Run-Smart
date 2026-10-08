import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import GuideBox from '../components/GuideBox';
import HistoryCalendar from '../components/HistoryCalendar';
import { getActivityMeta } from '../constants/activities';
import { MESSAGES } from '../constants/messages';
import { MS_PER_DAY } from '../constants/thresholds';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
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

/** 시간 표기 (예: 오후 3:07) */
function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });
}

/** 기록 날짜가 오늘로부터 며칠 전인지 (오늘이면 0) */
function daysAgoOf(iso: string): number {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = startOfDay(new Date()).getTime() - startOfDay(new Date(iso)).getTime();
  return Math.round(diff / MS_PER_DAY);
}

/** 히스토리 한 줄 (터치하면 그날의 AI 가이드를 펼친다) */
function HistoryItem({ entry }: { entry: HistoryEntry }) {
  const [open, setOpen] = useState(false);
  const meta = getActivityMeta(entry.activity);

  /** 펼칠 때만 열람 이벤트를 보낸다. */
  const handleToggle = () => {
    if (!open) {
      trackEvent(ANALYTICS_EVENTS.historyEntryViewed, {
        daysAgo: daysAgoOf(entry.date),
        decision: entry.decision,
        activity: entry.activity,
      });
    }
    setOpen((v) => !v);
  };

  return (
    <li className="space-y-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={handleToggle}
        className="w-full rounded-panel border border-card-border-ink bg-card-charcoal p-6 text-left"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-steel-border">{formatTime(entry.date)}</span>
          <span
            className={`text-sm font-medium ${
              entry.decision === 'go' ? 'text-lime-pulse' : 'text-steel-border'
            }`}
          >
            {entry.decision === 'go' ? '갔음' : '안 갔음'}
          </span>
        </div>
        <p className="text-base font-medium">
          {meta.emoji} {meta.label}
        </p>
        <p className="text-sm text-steel-border">{entry.weatherSummary}</p>
      </button>
      {open && (
        <GuideBox
          guide={{ state: 'ready', data: entry.guide }}
          rawWeather={entry.weatherSummary}
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
            // 날짜가 바뀌면 펼침 상태도 초기화되도록 key에 날짜를 섞는다.
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
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">활동 기록</h1>
        <Link to="/" className="text-sm text-steel-border">
          ← 홈
        </Link>
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
