import type { HourScore } from '../lib/bestHour';
import type { HourlyWeather } from '../types';

interface HourlyForecastProps {
  hourly: HourlyWeather[];
  scores: HourScore[];
  best: HourScore | null;
}

/** 시간 표기 (예: 7시) */
function hourLabel(hour: number): string {
  return `${hour}시`;
}

/** 시간대별 날씨(24시간)와 최적 시간대 제안 */
export default function HourlyForecast({ hourly, scores, best }: HourlyForecastProps) {
  return (
    <section className="rounded-panel border border-card-border-ink bg-card-charcoal p-6">
      <h2 className="mb-1 text-base font-bold">시간대별 날씨</h2>
      {best && (
        <p className="mb-3 text-sm text-steel-border">
          추천 시간대는 {hourLabel(best.hour)} ({best.score}점)이에요.
        </p>
      )}
      <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {hourly.map((h, i) => {
          const isBest = best?.hour === h.hour;
          return (
            <li
              key={h.hour}
              className={`flex w-16 shrink-0 flex-col items-center gap-1 rounded-md border px-2 py-3 text-xs ${
                isBest ? 'border-lime-pulse' : 'border-card-border-ink'
              }`}
            >
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
