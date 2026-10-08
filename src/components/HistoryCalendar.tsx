import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getActivityMeta } from '../constants/activities';
import {
  buildMonthGrid,
  dayKey,
  isMonthInRange,
  shiftMonth,
  type YearMonth,
} from '../lib/historyCalendar';
import type { HistoryEntry } from '../types';

/** 요일 머리글 (일요일 시작) */
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

interface HistoryCalendarProps {
  /** 보고 있는 달 */
  viewMonth: YearMonth;
  /** 선택한 날 */
  selected: Date;
  /** 오늘 */
  today: Date;
  /** 날짜별 기록 (dayKey 기준) */
  entriesByDay: Map<string, HistoryEntry[]>;
  onSelect: (date: Date) => void;
  onChangeMonth: (month: YearMonth) => void;
}

/** 셀 접근성 라벨 (예: 10월 7일, 가기 1건, 안 가기 1건) */
function buildCellLabel(date: Date, entries: HistoryEntry[]): string {
  const dateText = `${date.getMonth() + 1}월 ${date.getDate()}일`;
  if (entries.length === 0) return `${dateText}, 기록 없음`;
  const goCount = entries.filter((e) => e.decision === 'go').length;
  return `${dateText}, 가기 ${goCount}건, 안 가기 ${entries.length - goCount}건`;
}

/** 칸 안의 활동 표시: 첫 활동 이모지, 2개 이상이면 나머지 개수를 +N으로 보여준다. */
function DayMarker({ entries }: { entries: HistoryEntry[] }) {
  if (entries.length === 0) return null;
  const [first, ...rest] = entries;
  return (
    <span className="flex items-center justify-center gap-0.5 leading-none">
      <span className={`text-lg ${first.decision === 'skip' ? 'opacity-40' : ''}`}>
        {getActivityMeta(first.activity).emoji}
      </span>
      {rest.length > 0 && (
        <span className="text-xs font-medium text-steel-border">+{rest.length}</span>
      )}
    </span>
  );
}

interface DayCellProps {
  date: Date;
  entries: HistoryEntry[];
  isToday: boolean;
  isSelected: boolean;
  isFuture: boolean;
  onSelect: (date: Date) => void;
}

/** 달력의 하루 칸: 날짜 숫자와 그날의 활동 표시 (안 갔음은 흐리게) */
function DayCell({ date, entries, isToday, isSelected, isFuture, onSelect }: DayCellProps) {
  return (
    <button
      type="button"
      disabled={isFuture}
      aria-pressed={isSelected}
      aria-label={buildCellLabel(date, entries)}
      onClick={() => onSelect(date)}
      className={`flex min-h-20 w-full flex-col items-center gap-1 rounded-xl border p-1 text-base disabled:opacity-30 ${
        isSelected ? 'border-lime-pulse' : 'border-transparent'
      }`}
    >
      <span
        className={`flex size-8 items-center justify-center rounded-full ${
          isToday ? 'bg-pure-white font-bold text-carbon-black' : 'text-pure-white'
        }`}
      >
        {date.getDate()}
      </span>
      <DayMarker entries={entries} />
    </button>
  );
}

/** 달력 머리글: 연·월과 이전/다음 달 이동 버튼 */
function MonthHeader({
  viewMonth,
  today,
  onChangeMonth,
}: Pick<HistoryCalendarProps, 'viewMonth' | 'today' | 'onChangeMonth'>) {
  const prev = shiftMonth(viewMonth, -1);
  const next = shiftMonth(viewMonth, 1);
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="secondary"
        size="icon"
        aria-label="이전 달"
        disabled={!isMonthInRange(prev, today)}
        onClick={() => onChangeMonth(prev)}
      >
        <ChevronLeft />
      </Button>
      <h2 className="text-lg font-bold">
        {viewMonth.year}년 {viewMonth.month + 1}월
      </h2>
      <Button
        variant="secondary"
        size="icon"
        aria-label="다음 달"
        disabled={!isMonthInRange(next, today)}
        onClick={() => onChangeMonth(next)}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}

/** 월 단위 활동 기록 달력 */
export default function HistoryCalendar({
  viewMonth,
  selected,
  today,
  entriesByDay,
  onSelect,
  onChangeMonth,
}: HistoryCalendarProps) {
  const weeks = buildMonthGrid(viewMonth.year, viewMonth.month);
  return (
    <section className="space-y-3 rounded-panel border border-card-border-ink bg-card-charcoal p-4">
      <MonthHeader viewMonth={viewMonth} today={today} onChangeMonth={onChangeMonth} />
      <div className="grid grid-cols-7 text-center text-sm text-steel-border">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {weeks.flat().map((date, index) =>
          date ? (
            <DayCell
              key={dayKey(date)}
              date={date}
              entries={entriesByDay.get(dayKey(date)) ?? []}
              isToday={dayKey(date) === dayKey(today)}
              isSelected={dayKey(date) === dayKey(selected)}
              isFuture={date.getTime() > today.getTime() && dayKey(date) !== dayKey(today)}
              onSelect={onSelect}
            />
          ) : (
            <span key={`blank-${index}`} aria-hidden="true" />
          ),
        )}
      </div>
    </section>
  );
}
