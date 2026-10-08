import { useEffect, useRef, type UIEvent } from 'react';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import type { HourRange, HourScore } from '../lib/bestHour';
import { RECOMMEND_MIN_SCORE } from '../constants/thresholds';
import type { HourlyWeather } from '../types';

interface HourlyForecastProps {
  hourly: HourlyWeather[];
  scores: HourScore[];
  best: HourScore | null;
  /** 대표 시간대와 함께 좋은 연속 구간 (없으면 null) */
  range: HourRange | null;
  /** 선택한 활동 이름 (예: 러닝) */
  activityLabel: string;
}

/** 시간 표기 (예: 7시) */
function hourLabel(hour: number): string {
  return `${hour}시`;
}

/** 최고점이 추천 기준에 못 미치는 날의 안내 문구 */
const CAUTION_NOTICE = '오늘은 전반적으로 조심하세요.';

/**
 * 추천 시간대 안내 문구를 만든다.
 * @param best 대표 시간대
 * @param range 함께 좋은 연속 구간
 * @param activityLabel 활동 이름
 */
function buildRecommendText(best: HourScore, range: HourRange | null, activityLabel: string): string {
  if (range) {
    const span = `${range.startHour}~${hourLabel(range.endHour)}`;
    return `오늘의 ${activityLabel} 추천 시간대는 ${span}예요. (최고 ${hourLabel(best.hour)} ${best.score}점)`;
  }
  const base = `오늘의 ${activityLabel} 추천 시간대는 ${hourLabel(best.hour)}(${best.score}점)이에요.`;
  return best.score < RECOMMEND_MIN_SCORE ? `${base} ${CAUTION_NOTICE}` : base;
}

/** 목록 첫 시각보다 시(hour)가 작아지면 자정을 넘긴 내일로 본다. */
function isTomorrow(hour: number, firstHour: number): boolean {
  return hour < firstHour;
}

/** 스크롤이 멈췄다고 보는 대기 시간(ms) */
const SCROLL_IDLE_MS = 800;

/** 가로 목록에서 화면에 보이는 마지막 항목의 인덱스 */
function lastVisibleIndex(list: HTMLUListElement): number {
  const items = Array.from(list.children) as HTMLElement[];
  const right = list.scrollLeft + list.clientWidth;
  const hiddenCount = items.filter((item) => item.offsetLeft - items[0].offsetLeft >= right).length;
  return Math.max(items.length - hiddenCount - 1, 0);
}

/** 시간대별 날씨(현재 시각부터 24시간)와 최적 시간대 제안 */
export default function HourlyForecast({
  hourly,
  scores,
  best,
  range,
  activityLabel,
}: HourlyForecastProps) {
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
    <section className="rounded-panel border border-card-border-ink bg-card-charcoal p-6">
      <h2 className="mb-1 text-base font-bold">시간대별 날씨</h2>
      {best && (
        <p className="mb-3 text-sm text-steel-border">
          {buildRecommendText(best, range, activityLabel)}
        </p>
      )}
      <ul
        onScroll={handleScroll}
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2"
      >
        {hourly.map((h, i) => {
          const isBest = best?.hour === h.hour;
          return (
            <li
              key={h.hour}
              className={`flex w-16 shrink-0 flex-col items-center gap-1 rounded-md border px-2 py-3 text-xs ${
                isBest ? 'border-lime-pulse' : 'border-card-border-ink'
              }`}
            >
              <span className="text-[10px] text-steel-border">
                {isTomorrow(h.hour, firstHour) ? '내일' : '오늘'}
              </span>
              <span className="font-medium">{hourLabel(h.hour)}</span>
              <span className="text-base font-bold">{h.temp}°</span>
              <span>{scores[i]?.score}점</span>
              <span className="text-steel-border">💧{h.precipitation}</span>
              <span className="text-steel-border">{h.humidity}%</span>
              <span className="text-steel-border">{h.windSpeed}m/s</span>
              <span className="text-steel-border">PM{h.pm10}</span>
              <span className="text-steel-border">UV{h.uvIndex}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
