import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { Weather } from '../types';
import HomeScoreCard from './HomeScoreCard';

/** 미세먼지 외에는 평범한 낮 날씨 */
const BASE: Weather = {
  temp: 15,
  humidity: 45,
  windSpeed: 2,
  precipitation: 0,
  condition: '맑음',
  pm10: 60,
  uvIndex: 2,
  isDay: true,
};

/** 마크업 문자열로 렌더링 */
function render(weather: Weather): string {
  return renderToStaticMarkup(
    <HomeScoreCard score={80} weather={weather} feelsLike={14} reasons={[]} onOpenBreakdown={() => {}} />,
  );
}

describe('HomeScoreCard 미세먼지 칸', () => {
  it('초미세먼지 값이 있으면 나쁜 쪽 등급과 두 값을 함께 보여준다', () => {
    const html = render({ ...BASE, pm25: 40, pm10Source: 'observed' });
    expect(html).toContain('나쁨');
    expect(html).toContain('PM10 60 · PM2.5 40');
    expect(html).not.toContain('보통 (60)');
  });

  it('초미세먼지 값이 없으면 지금처럼 등급과 PM10만 보여준다', () => {
    const html = render({ ...BASE, pm10Source: 'model' });
    expect(html).toContain('보통 (60)');
    expect(html).not.toContain('PM2.5');
  });

  it('미세먼지 값이 없으면 확인 불가만 보여준다', () => {
    const html = render({ ...BASE, pm10: 0, pm25: 40, pm10Source: 'none' });
    expect(html).toContain('확인 불가');
    expect(html).not.toContain('PM2.5');
  });
});
