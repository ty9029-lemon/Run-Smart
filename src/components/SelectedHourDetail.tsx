import { Droplet, Grip, Sun, ThermometerSun, Umbrella, Wind, type LucideIcon } from 'lucide-react';
import {
  GRADE_TEXT_CLASS,
  SCORE_LEVEL_NAME,
  SCORE_LEVEL_TEXT_CLASS,
} from '../constants/levelStyles';
import { getWeatherEmoji } from '../constants/weatherEmoji';
import { getDustGrade, getUvLevel } from '../lib/airGrade';
import { formatHourLabel } from '../lib/formatTime';
import { scoreToLevel } from '../lib/runScore';
import type { ScoreDelta } from '../lib/scoreReasons';
import type { HourlyWeather } from '../types';
import ScoreDeltaLine from './ScoreDeltaLine';

interface SelectedHourDetailProps {
  weather: HourlyWeather;
  /** 그 시각의 활동 지수 */
  score: number;
  /** 그 시각의 개인 체감온도 */
  feelsLike: number;
  /** 지금과 비교한 항목별 점수 차이. 지금 시각이면 null(비교하지 않는다) */
  deltas?: ScoreDelta[] | null;
}

/** 지표 타일 한 칸 */
interface Tile {
  label: string;
  value: string;
  icon: LucideIcon;
  valueClass?: string;
}

/** 선택한 시각의 지표 6칸 */
function buildTiles(weather: HourlyWeather, feelsLike: number): Tile[] {
  const dust = getDustGrade(weather.pm10);
  const uv = getUvLevel(weather.uvIndex);
  return [
    { label: '체감온도', value: `${feelsLike}°C`, icon: ThermometerSun },
    { label: '풍속', value: `${weather.windSpeed}m/s`, icon: Wind },
    { label: '강수량', value: `${weather.precipitation}mm`, icon: Umbrella },
    { label: '습도', value: `${weather.humidity}%`, icon: Droplet },
    {
      label: '미세먼지',
      value: `${dust} (${weather.pm10})`,
      icon: Grip,
      valueClass: GRADE_TEXT_CLASS[dust],
    },
    {
      label: '자외선',
      value: `${uv} (${weather.uvIndex})`,
      icon: Sun,
      valueClass: GRADE_TEXT_CLASS[uv],
    },
  ];
}

/** 차트에서 고른 시각의 기온·날씨·점수와 지표 6칸 */
export default function SelectedHourDetail({
  weather,
  score,
  feelsLike,
  deltas = null,
}: SelectedHourDetailProps) {
  const level = scoreToLevel(score);
  const emoji = getWeatherEmoji(weather.condition, weather.isDay);
  return (
    <section aria-label="선택한 시간 상세" className="space-y-3">
      <div className="space-y-2">
        <p className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">선택한 시간</span>
          <span className="font-bold">{formatHourLabel(weather.hour)}</span>
        </p>
        <div className="flex items-end justify-between">
          <p className="flex items-center gap-3 text-4xl font-bold leading-none">
            <span>{weather.temp}°C</span>
            {emoji && (
              <span role="img" aria-label={weather.condition}>
                {emoji}
              </span>
            )}
          </p>
          <p className={`text-2xl font-bold leading-snug ${SCORE_LEVEL_TEXT_CLASS[level]}`}>
            {score}점 {SCORE_LEVEL_NAME[level]}
          </p>
        </div>
        {deltas && <ScoreDeltaLine deltas={deltas} />}
      </div>
      <dl className="grid grid-cols-3 gap-2">
        {buildTiles(weather, feelsLike).map(({ label, value, icon: Icon, valueClass }) => (
          <div key={label} className="rounded-[12px] bg-card p-3">
            <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Icon aria-hidden="true" className="size-4" />
              {label}
            </dt>
            <dd className={`text-base font-bold ${valueClass ?? ''}`}>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
