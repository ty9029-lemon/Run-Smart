import { useEffect, useRef, type UIEvent } from 'react';
import { SCORE_LEVEL_BAR_CLASS } from '../constants/levelStyles';
import { RECOMMEND_CUTOFF_HOUR, RECOMMEND_MIN_SCORE } from '../constants/thresholds';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import { isRecommendableHour, type HourRange, type HourScore } from '../lib/bestHour';
import { scoreToLevel } from '../lib/runScore';
import type { SunsetStatus } from '../lib/scoreFactors';
import type { HourlyWeather } from '../types';

interface HourlyChartProps {
  hourly: HourlyWeather[];
  scores: HourScore[];
  /** 막대에서 선택된 시각(시) */
  selectedHour: number | null;
  onSelectHour: (hour: number) => void;
  best: HourScore | null;
  /** 대표 시간대와 함께 좋은 연속 구간 (없으면 null) */
  range: HourRange | null;
  /** 선택한 활동 이름 (예: 러닝) */
  activityLabel: string;
  /** 일몰 상태 (등산·자전거는 일몰 3시간 전부터 '임박', 해가 지면 '지남') */
  sunsetStatus: SunsetStatus;
}

/** 시간 표기 (예: 7시) */
function hourLabel(hour: number): string {
  return `${hour}시`;
}

/** 최고점이 추천 기준에 못 미치는 날의 안내 문구 */
const CAUTION_NOTICE = '오늘은 전반적으로 조심하세요.';

/** 일몰 상태별 안내 문구 */
const SUNSET_NOTICES = {
  approaching: '오늘은 일몰 시간이 곧 다가와요. 전반적으로 조심하세요.',
  passed: '일몰 시간이 지났습니다. 일조량이 없으니 전반적으로 조심하세요.',
} as const;

/** 스크롤이 멈췄다고 보는 대기 시간(ms) */
const SCROLL_IDLE_MS = 800;

/** 막대 영역 높이(px). 막대 높이는 점수 비율로 정한다. */
const BAR_AREA_HEIGHT = 138;

/**
 * 연속 구간이 없을 때의 안내 문구를 만든다.
 * @param best 대표 시간대 (없으면 추천 가능한 시간이 없는 것)
 */
function buildFallbackText(
  best: HourScore | null,
  activityLabel: string,
  sunsetStatus: SunsetStatus,
): string {
  if (!best) return `오늘은 추천할 ${activityLabel} 시간이 없어요.`;
  const base = `오늘 ${activityLabel}은 ${hourLabel(best.hour)}(${best.score}점)이 가장 좋아요.`;
  if (sunsetStatus) return `${base} ${SUNSET_NOTICES[sunsetStatus]}`;
  return best.score < RECOMMEND_MIN_SCORE ? `${base} ${CAUTION_NOTICE}` : base;
}

/** 차트 제목: 연속 구간이 있으면 구간을 라임색으로 강조한다. */
function ChartTitle({
  best,
  range,
  activityLabel,
  sunsetStatus,
}: Pick<HourlyChartProps, 'best' | 'range' | 'activityLabel' | 'sunsetStatus'>) {
  if (!range) {
    return (
      <h2 className="px-4 text-xl font-bold leading-snug">
        {buildFallbackText(best, activityLabel, sunsetStatus)}
      </h2>
    );
  }
  return (
    <h2 className="px-4 text-xl font-bold leading-snug">
      오늘{' '}
      <span className="text-primary">
        {range.startHour}~{hourLabel(range.endHour)}
      </span>{' '}
      {activityLabel}하기 좋아요
    </h2>
  );
}

/** 막대 아래 라벨: 첫 칸은 지금, 자정을 넘긴 첫 칸은 내일, 그 밖은 시각 */
function barLabel(hour: number, index: number, firstHour: number): string {
  if (index === 0) return '지금';
  if (hour === 0 && firstHour !== 0) return '내일';
  return hourLabel(hour);
}

/** 가로 목록에서 화면에 보이는 마지막 항목의 인덱스 */
function lastVisibleIndex(list: HTMLUListElement): number {
  const items = Array.from(list.children) as HTMLElement[];
  const right = list.scrollLeft + list.clientWidth;
  const hiddenCount = items.filter((item) => item.offsetLeft - items[0].offsetLeft >= right).length;
  return Math.max(items.length - hiddenCount - 1, 0);
}

/** 추천 제외 시각(22시) 앞에 세우는 구분선과 안내 */
function CutoffMarker() {
  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-35 w-px bg-chart-4"
      />
      <span className="pointer-events-none absolute left-1.5 top-0.5 whitespace-nowrap text-[11px] leading-[14px] text-steel-border">
        {RECOMMEND_CUTOFF_HOUR}시 이후
        <br />
        추천 제외
      </span>
    </>
  );
}

interface HourBarProps {
  label: string;
  score: number;
  isSelected: boolean;
  isExcluded: boolean;
  onSelect: () => void;
}

/** 시간대 막대 한 칸 (눌러서 선택). 점수 단계로 색을 정하고, 선택 안 된 칸은 흐리게 그린다. */
function HourBar({ label, score, isSelected, isExcluded, onSelect }: HourBarProps) {
  const fade = isSelected ? '' : isExcluded ? 'opacity-15' : 'opacity-40';
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-label={`${label} ${score}점`}
      onClick={onSelect}
      className="flex h-40 w-8 flex-col items-center gap-1 px-1"
    >
      <span className="flex w-full flex-1 items-end">
        <span
          className={`w-full rounded-t-lg ${SCORE_LEVEL_BAR_CLASS[scoreToLevel(score)]} ${fade}`}
          style={{ height: `${(score / 100) * BAR_AREA_HEIGHT}px` }}
        />
      </span>
      <span
        className={`whitespace-nowrap text-xs tracking-tight ${isSelected ? 'font-bold text-foreground' : 'font-medium text-steel-border'}`}
      >
        {label}
      </span>
    </button>
  );
}

/** 시간대별 활동 지수 막대 차트 (현재 시각부터 24시간, 가로 스크롤) */
export default function HourlyChart({
  hourly,
  scores,
  selectedHour,
  onSelectHour,
  best,
  range,
  activityLabel,
  sunsetStatus,
}: HourlyChartProps) {
  const timerRef = useRef<number>();
  const hasSentRef = useRef(false);
  const firstHour = hourly[0]?.hour ?? 0;

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  /** 스크롤이 멈추면 도달한 시간대와 함께 화면 진입당 1회만 전송한다. */
  const handleScroll = (e: UIEvent<HTMLUListElement>) => {
    if (hasSentRef.current) return;
    const list = e.currentTarget;
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      hasSentRef.current = true;
      trackEvent(ANALYTICS_EVENTS.hourlyForecastScrolled, {
        maxHour: hourly[lastVisibleIndex(list)]?.hour ?? 0,
      });
    }, SCROLL_IDLE_MS);
  };

  return (
    <div className="-mx-4 space-y-4">
      <ChartTitle best={best} range={range} activityLabel={activityLabel} sunsetStatus={sunsetStatus} />
      <ul onScroll={handleScroll} className="flex overflow-x-auto pl-4">
        {hourly.map((h, i) => (
          <li key={h.hour} className="relative shrink-0">
            {h.hour === RECOMMEND_CUTOFF_HOUR && <CutoffMarker />}
            <HourBar
              label={barLabel(h.hour, i, firstHour)}
              score={scores[i]?.score ?? 0}
              isSelected={h.hour === selectedHour}
              isExcluded={!isRecommendableHour(h.hour) || (i > 0 && h.hour < firstHour)}
              onSelect={() => onSelectHour(h.hour)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
