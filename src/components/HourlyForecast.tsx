import { useEffect, useRef, useState, type UIEvent } from 'react';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import type { HourRange, HourScore } from '../lib/bestHour';
import { RECOMMEND_MIN_SCORE, SCORE_CAUTION, SCORE_MAX } from '../constants/thresholds';
import type { SunsetStatus } from '../lib/scoreFactors';
import type { HourlyWeather } from '../types';

interface HourlyForecastProps {
  hourly: HourlyWeather[];
  scores: HourScore[];
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

/**
 * 추천 시간대 안내 문구를 만든다.
 * @param best 대표 시간대
 * @param range 함께 좋은 연속 구간
 * @param activityLabel 활동 이름
 * @param sunsetStatus 일몰 상태
 */
function buildRecommendText(
  best: HourScore,
  range: HourRange | null,
  activityLabel: string,
  sunsetStatus: SunsetStatus,
): string {
  if (range) {
    const span = `${range.startHour}~${hourLabel(range.endHour)}`;
    return `오늘의 ${activityLabel} 추천 시간대는 ${span}예요. (최고 ${hourLabel(best.hour)} ${best.score}점)`;
  }
  const base = `오늘의 ${activityLabel} 추천 시간대는 ${hourLabel(best.hour)}(${best.score}점)이에요.`;
  if (sunsetStatus) return `${base} ${SUNSET_NOTICES[sunsetStatus]}`;
  return best.score < RECOMMEND_MIN_SCORE ? `${base} ${CAUTION_NOTICE}` : base;
}

/** 목록 첫 시각보다 시(hour)가 작아지면 자정을 넘긴 내일로 본다. */
function isTomorrow(hour: number, firstHour: number): boolean {
  return hour < firstHour;
}

/** 스크롤이 멈췄다고 보는 대기 시간(ms) */
const SCROLL_IDLE_MS = 800;

/** 막대 영역(점수 숫자 포함) 높이(px) */
const CHART_HEIGHT = 128;
/** 막대 최소·최대 높이(px). 최저점도 눈에 보이도록 최소 높이를 둔다 */
const BAR_MIN_HEIGHT = 12;
const BAR_MAX_HEIGHT = 96;
/** 막대 높이 계산에서 0으로 보는 점수. 점수 차이가 잘 보이도록 바닥을 올린다 */
const BAR_SCORE_FLOOR = 40;
/** 선택되지 않은 막대의 불투명도 */
const BAR_DIM_OPACITY = 0.45;

/** 점수 등급별 막대·숫자 색 (Tailwind가 클래스를 찾도록 전체 이름으로 적는다) */
const SCORE_TONES = {
  good: { bar: 'bg-lime-pulse', text: 'text-highlight' },
  caution: { bar: 'bg-score-caution', text: 'text-score-caution' },
  warn: { bar: 'bg-score-warn', text: 'text-score-warn' },
} as const;

/** 점수에 맞는 색 등급 */
function scoreTone(score: number) {
  if (score >= RECOMMEND_MIN_SCORE) return SCORE_TONES.good;
  if (score >= SCORE_CAUTION) return SCORE_TONES.caution;
  return SCORE_TONES.warn;
}

/** 점수에 비례한 막대 높이(px) */
function barHeight(score: number): number {
  const ratio = (score - BAR_SCORE_FLOOR) / (SCORE_MAX - BAR_SCORE_FLOOR);
  const clamped = Math.min(Math.max(ratio, 0), 1);
  return Math.round(BAR_MIN_HEIGHT + clamped * (BAR_MAX_HEIGHT - BAR_MIN_HEIGHT));
}

/** 함께 추천하는 시간대인지 (구간이 없으면 대표 시간대만) */
function isRecommended(hour: number, best: HourScore | null, range: HourRange | null): boolean {
  if (!range) return best?.hour === hour;
  return hour >= range.startHour && hour <= range.endHour;
}

/** 가로 목록에서 화면에 보이는 마지막 항목의 인덱스 */
function lastVisibleIndex(list: HTMLUListElement): number {
  const items = Array.from(list.children) as HTMLElement[];
  const right = list.scrollLeft + list.clientWidth;
  const hiddenCount = items.filter((item) => item.offsetLeft - items[0].offsetLeft >= right).length;
  return Math.max(items.length - hiddenCount - 1, 0);
}

interface BarColumnProps {
  hour: number;
  score: number;
  isTomorrow: boolean;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: () => void;
}

/** 시간대 하나의 점수 막대. 열 전체가 눌리는 버튼이라 낮은 막대도 쉽게 선택된다. */
function BarColumn({
  hour,
  score,
  isTomorrow: tomorrow,
  isSelected,
  isRecommended: recommended,
  onSelect,
}: BarColumnProps) {
  const tone = scoreTone(score);
  return (
    <li className="w-12 shrink-0">
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={isSelected}
        aria-label={`${tomorrow ? '내일 ' : ''}${hourLabel(hour)} ${score}점`}
        className={`flex w-full flex-col items-center gap-1 rounded-md px-1 py-1 ${
          isSelected ? 'bg-foreground/10' : ''
        }`}
      >
        <div
          className="flex w-full flex-col items-center justify-end gap-1"
          style={{ height: CHART_HEIGHT, opacity: isSelected ? 1 : BAR_DIM_OPACITY }}
        >
          <span className={`text-[11px] font-bold ${tone.text}`}>{score}</span>
          <div
            className={`w-6 rounded-sm ${tone.bar}`}
            style={{ height: barHeight(score) }}
          />
        </div>
        <div
          className={`h-[3px] w-full rounded-full ${recommended ? 'bg-lime-pulse' : 'bg-transparent'}`}
        />
        <span className="text-[10px] text-muted-foreground">{tomorrow ? '내일' : '오늘'}</span>
        <span className="text-xs font-medium">{hourLabel(hour)}</span>
      </button>
    </li>
  );
}

/** 상세 패널에 보여줄 항목: [라벨, 값] */
function detailItems(h: HourlyWeather): [string, string][] {
  return [
    ['강수', `${h.precipitation}mm`],
    ['습도', `${h.humidity}%`],
    ['풍속', `${h.windSpeed}m/s`],
    ['미세먼지', `PM${h.pm10}`],
    ['자외선', `UV${h.uvIndex}`],
  ];
}

interface DetailPanelProps {
  weather: HourlyWeather;
  score: number;
  isTomorrow: boolean;
}

/** 선택한 시간대의 기온·점수·세부 날씨 */
function DetailPanel({ weather, score, isTomorrow: tomorrow }: DetailPanelProps) {
  return (
    <div className="mt-2 rounded-md border border-border p-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            {tomorrow ? '내일' : '오늘'} {hourLabel(weather.hour)}
          </p>
          <p className="text-2xl font-bold">{weather.temp}°</p>
        </div>
        <p className={`text-2xl font-bold ${scoreTone(score).text}`}>{score}점</p>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
        {detailItems(weather).map(([label, value]) => (
          <div key={label} className="rounded-md bg-foreground/5 px-2 py-2">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-sm font-bold">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * 가로 목록의 처음 자리 잡기와 스크롤 분석 이벤트를 맡는다.
 * 처음 한 번 선택된 막대를 가운데로 스크롤하고(이 스크롤은 사용자 스크롤로 세지 않는다),
 * 사용자가 스크롤을 멈추면 도달한 시간대를 화면 진입당 1회만 전송한다.
 * @param hourly 시간대별 날씨
 * @param selectedIndex 처음 가운데에 둘 막대의 인덱스
 */
function useHourlyScroll(hourly: HourlyWeather[], selectedIndex: number) {
  const listRef = useRef<HTMLUListElement>(null);
  const timerRef = useRef<number>();
  const hasSentRef = useRef(false);
  const skipScrollRef = useRef(false);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  useEffect(() => {
    const list = listRef.current;
    const target = list?.children[selectedIndex] as HTMLElement | undefined;
    if (!list || !target) return;
    const left = target.offsetLeft - list.offsetLeft - (list.clientWidth - target.clientWidth) / 2;
    const next = Math.min(Math.max(left, 0), list.scrollWidth - list.clientWidth);
    if (Math.abs(next - list.scrollLeft) < 1) return;
    skipScrollRef.current = true;
    list.scrollLeft = next;
    // 처음 한 번만 자리를 잡는다 (이후 선택 변경으로는 스크롤하지 않는다)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (e: UIEvent<HTMLUListElement>) => {
    if (skipScrollRef.current) {
      skipScrollRef.current = false;
      return;
    }
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

  return { listRef, handleScroll };
}

/** 시간대별 날씨(현재 시각부터 24시간)와 최적 시간대 제안 */
export default function HourlyForecast({
  hourly,
  scores,
  best,
  range,
  activityLabel,
  sunsetStatus,
}: HourlyForecastProps) {
  const [pickedHour, setPickedHour] = useState<number | null>(null);
  const firstHour = hourly[0]?.hour ?? 0;
  const selectedHour = pickedHour ?? best?.hour ?? firstHour;
  const selectedIndex = Math.max(hourly.findIndex((h) => h.hour === selectedHour), 0);
  const { listRef, handleScroll } = useHourlyScroll(hourly, selectedIndex);
  const selected = hourly[selectedIndex];

  return (
    <section className="rounded-panel border border-border bg-card p-6">
      <h2 className="mb-1 text-base font-bold">시간대별 날씨</h2>
      {best && (
        <p className="mb-3 text-sm text-muted-foreground">
          {buildRecommendText(best, range, activityLabel, sunsetStatus)}
        </p>
      )}
      <ul
        ref={listRef}
        onScroll={handleScroll}
        className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-2"
      >
        {hourly.map((h, i) => (
          <BarColumn
            key={h.hour}
            hour={h.hour}
            score={scores[i]?.score ?? 0}
            isTomorrow={isTomorrow(h.hour, firstHour)}
            isSelected={i === selectedIndex}
            isRecommended={isRecommended(h.hour, best, range)}
            onSelect={() => setPickedHour(h.hour)}
          />
        ))}
      </ul>
      {selected && (
        <DetailPanel
          weather={selected}
          score={scores[selectedIndex]?.score ?? 0}
          isTomorrow={isTomorrow(selected.hour, firstHour)}
        />
      )}
    </section>
  );
}
