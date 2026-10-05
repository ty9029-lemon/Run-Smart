import { useState } from 'react';
import { Link } from 'react-router-dom';
import GuideBox from '../components/GuideBox';
import { getActivityMeta } from '../constants/activities';
import { useHistoryStore } from '../store/historyStore';
import type { HistoryEntry } from '../types';

/** 날짜 표기 (예: 10월 5일 (월)) */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

/** 히스토리 한 줄 (터치하면 그날의 AI 가이드를 펼친다) */
function HistoryItem({ entry }: { entry: HistoryEntry }) {
  const [open, setOpen] = useState(false);
  const meta = getActivityMeta(entry.activity);
  return (
    <li className="space-y-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-panel border border-card-border-ink bg-card-charcoal p-6 text-left"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-steel-border">{formatDate(entry.date)}</span>
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
      {open && <GuideBox guide={entry.guide} />}
    </li>
  );
}

/** 활동 히스토리 (최근 7일) */
export default function History() {
  const entries = useHistoryStore((s) => s.entries);
  return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">최근 7일 기록</h1>
        <Link to="/" className="text-sm text-steel-border">
          ← 홈
        </Link>
      </header>
      {entries.length === 0 ? (
        <p className="text-sm text-steel-border">아직 기록이 없어요.</p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <HistoryItem key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
    </main>
  );
}
