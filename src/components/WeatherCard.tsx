import { getWeatherEmoji } from '../constants/weatherEmoji';
import { getDustGrade } from '../lib/airGrade';
import type { Weather } from '../types';

interface WeatherCardProps {
  weather: Weather;
  feelsLike: number;
}

/** 실시간 날씨 카드 (기온과 날씨 이모지, 체감온도, 습도, 강수, 풍속, 미세먼지) */
export default function WeatherCard({ weather, feelsLike }: WeatherCardProps) {
  const emoji = getWeatherEmoji(weather.condition, weather.isDay);
  const cells = [
    { label: '체감온도', value: `${feelsLike}°C` },
    { label: '습도', value: `${weather.humidity}%` },
    { label: '강수', value: `${weather.precipitation}mm` },
    { label: '풍속', value: `${weather.windSpeed}m/s` },
    { label: '미세먼지', value: `${getDustGrade(weather.pm10)} (${weather.pm10})` },
    { label: '자외선', value: `${weather.uvIndex}` },
  ];
  return (
    <section className="rounded-panel border border-card-border-ink bg-card-charcoal p-6">
      <div className="mb-4 flex items-baseline gap-3">
        <span className="text-4xl font-bold">{weather.temp}°C</span>
        {emoji ? (
          <span
            role="img"
            aria-label={weather.condition}
            title={weather.condition}
            className="text-3xl"
          >
            {emoji}
          </span>
        ) : (
          <span className="text-base text-steel-border">{weather.condition}</span>
        )}
      </div>
      <dl className="grid grid-cols-3 gap-x-3 gap-y-4">
        {cells.map((cell) => (
          <div key={cell.label}>
            <dt className="text-sm text-steel-border">{cell.label}</dt>
            <dd className="text-base font-medium">{cell.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
