import ScoreReasonLine from './ScoreReasonLine';
import ScoreRing from './ScoreRing';
import type { ScoreReason } from '../lib/scoreReasons';
import { GRADE_TEXT_CLASS } from '../constants/levelStyles';
import { getWeatherEmoji } from '../constants/weatherEmoji';
import {
  formatDust,
  formatDustDetail,
  getOverallDustGrade,
  getUvLevel,
  hasDustData,
} from '../lib/airGrade';
import type { Weather } from '../types';

interface HomeScoreCardProps {
  score: number;
  weather: Weather;
  /** 개인 체감온도 */
  feelsLike: number;
  /** 항목별 점수 근거 */
  reasons: ScoreReason[];
  onOpenBreakdown: () => void;
}

/** 지표 한 칸 (등급 색을 줄 값은 valueClass로 넘긴다) */
interface Metric {
  label: string;
  value: string;
  valueClass?: string;
  /** 값 아래에 작게 보이는 부가 문구 */
  detail?: string;
}

/** 지금 날씨의 지표 6칸 (체감온도, 습도, 강수, 풍속, 미세먼지, 자외선) */
function buildMetrics(weather: Weather, feelsLike: number): Metric[] {
  const dust = getOverallDustGrade(weather.pm10, weather.pm25);
  const uv = getUvLevel(weather.uvIndex);
  return [
    { label: '체감온도', value: `${feelsLike}°C` },
    { label: '습도', value: `${weather.humidity}%` },
    { label: '강수', value: `${weather.precipitation}mm` },
    { label: '풍속', value: `${weather.windSpeed}m/s` },
    {
      label: '미세먼지',
      value: formatDust(weather),
      valueClass: hasDustData(weather) ? GRADE_TEXT_CLASS[dust] : undefined,
      detail: formatDustDetail(weather) ?? undefined,
    },
    { label: '자외선', value: `${uv} (${weather.uvIndex})`, valueClass: GRADE_TEXT_CLASS[uv] },
  ];
}

/** 활동 지수 링과 지금 날씨(기온, 이모지, 지표 6칸)를 한 카드로 보여준다. */
export default function HomeScoreCard({
  score,
  weather,
  feelsLike,
  reasons,
  onOpenBreakdown,
}: HomeScoreCardProps) {
  const emoji = getWeatherEmoji(weather.condition, weather.isDay);
  return (
    <section className="space-y-4 rounded-panel bg-card p-6">
      <div className="flex items-center gap-6">
        <ScoreRing score={score} />
        <div className="flex items-center gap-3 text-[28px] font-bold leading-none">
          <span>{weather.temp}°C</span>
          {emoji ? (
            <span role="img" aria-label={weather.condition} title={weather.condition}>
              {emoji}
            </span>
          ) : (
            <span className="text-base font-normal text-muted-foreground">{weather.condition}</span>
          )}
        </div>
      </div>
      <dl className="grid grid-cols-3 gap-x-5 gap-y-3 pl-2">
        {buildMetrics(weather, feelsLike).map(({ label, value, valueClass, detail }) => (
          <div key={label}>
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className={`text-base font-bold ${valueClass ?? ''}`}>{value}</dd>
            {detail && <dd className="text-xs text-muted-foreground">{detail}</dd>}
          </div>
        ))}
      </dl>
      <ScoreReasonLine reasons={reasons} onOpenBreakdown={onOpenBreakdown} />
    </section>
  );
}
