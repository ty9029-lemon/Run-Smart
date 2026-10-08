import { describe, expect, it } from 'vitest';
import {
  buildForecastQuery,
  parseWeather,
  weatherCodeToCondition,
  type AirResponse,
  type ForecastResponse,
} from './openMeteo';

/** 오늘·내일 48시간 시각 배열 (현지 시간) */
const TIMES = Array.from({ length: 48 }, (_, i) => {
  const day = i < 24 ? '06' : '07';
  return `2026-10-${day}T${String(i % 24).padStart(2, '0')}:00`;
});

/** 모든 시간이 같은 값인 예보 응답을 만든다. */
function makeForecast(nowTime: string): ForecastResponse {
  const fill = (v: number) => TIMES.map(() => v);
  return {
    current: {
      time: nowTime,
      temperature_2m: 12.34,
      relative_humidity_2m: 65.4,
      wind_speed_10m: 8.04,
      precipitation: 0,
      weather_code: 3,
    },
    hourly: {
      time: TIMES,
      temperature_2m: fill(10),
      relative_humidity_2m: fill(70),
      wind_speed_10m: fill(3),
      precipitation: fill(0),
      weather_code: fill(0),
      uv_index: TIMES.map((_, i) => i % 24),
    },
  };
}

/** 시간대 번호가 곧 PM10 값인 대기질 응답 */
const AIR: AirResponse = { hourly: { time: TIMES, pm10: TIMES.map((_, i) => i * 2) } };

describe('weatherCodeToCondition', () => {
  it('WMO 코드를 한글 날씨로 바꾼다', () => {
    expect(weatherCodeToCondition(0)).toBe('맑음');
    expect(weatherCodeToCondition(3)).toBe('흐림');
    expect(weatherCodeToCondition(63)).toBe('비');
    expect(weatherCodeToCondition(95)).toBe('뇌우');
  });

  it('알 수 없는 코드는 대체 문구를 쓴다', () => {
    expect(weatherCodeToCondition(1000)).toBe('알 수 없음');
  });
});

describe('buildForecastQuery', () => {
  it('풍속은 m/s, 오늘·내일 2일치 예보를 요청한다', () => {
    const query = buildForecastQuery({ lat: 37.5, lon: 127 });
    expect(query).toContain('wind_speed_unit=ms');
    expect(query).toContain('forecast_days=2');
    expect(query).toContain('uv_index');
  });
});

describe('parseWeather', () => {
  it('현재 날씨를 반올림하고 현재 시각의 자외선·미세먼지를 붙인다', () => {
    const { current } = parseWeather(makeForecast('2026-10-06T14:15'), AIR);
    expect(current).toEqual({
      temp: 12.3,
      humidity: 65,
      windSpeed: 8,
      precipitation: 0,
      condition: '흐림',
      pm10: 28,
      uvIndex: 14,
      isDay: true,
    });
  });

  it('시간대별 날씨는 오늘·내일 48개로 변환하고 PM10을 날짜별로 구분한다', () => {
    const { hourly } = parseWeather(makeForecast('2026-10-06T00:00'), AIR);
    expect(hourly).toHaveLength(48);
    expect(hourly[5]).toMatchObject({ hour: 5, pm10: 10, condition: '맑음' });
    expect(hourly[29]).toMatchObject({ hour: 5, pm10: 58 });
  });

  it('대기질 응답이 비어 있어도 날씨는 변환하고 PM10은 0으로 둔다', () => {
    const empty: AirResponse = { hourly: { time: [], pm10: [] } };
    const { current, hourly } = parseWeather(makeForecast('2026-10-06T09:00'), empty);
    expect(current.pm10).toBe(0);
    expect(hourly.every((h) => h.pm10 === 0)).toBe(true);
  });

  it('PM10 값이 null인 시간은 0으로 둔다', () => {
    const air: AirResponse = { hourly: { time: TIMES, pm10: TIMES.map(() => null) } };
    expect(parseWeather(makeForecast('2026-10-06T09:00'), air).current.pm10).toBe(0);
  });

  it('is_day를 낮/밤 boolean으로 변환하고, 값이 없으면 낮으로 본다', () => {
    const forecast = makeForecast('2026-10-06T22:00');
    forecast.current.is_day = 0;
    forecast.hourly.is_day = TIMES.map((_, i) => (i % 24 >= 6 && i % 24 < 20 ? 1 : 0));
    const { current, hourly } = parseWeather(forecast, AIR);
    expect(current.isDay).toBe(false);
    expect(hourly[3].isDay).toBe(false);
    expect(hourly[12].isDay).toBe(true);
    expect(parseWeather(makeForecast('2026-10-06T22:00'), AIR).current.isDay).toBe(true);
  });

  it('daily.sunset으로 시간대별·현재의 일몰까지 남은 시간을 계산한다', () => {
    const forecast = makeForecast('2026-10-06T16:30');
    forecast.daily = { time: ['2026-10-06', '2026-10-07'], sunset: ['2026-10-06T18:12', '2026-10-07T18:10'] };
    const { current, hourly } = parseWeather(forecast, AIR);
    expect(current.hoursUntilSunset).toBeCloseTo(1.7);
    expect(hourly[15].hoursUntilSunset).toBeCloseTo(3.2);
    expect(hourly[19].hoursUntilSunset).toBeCloseTo(-0.8);
    expect(hourly[39].hoursUntilSunset).toBeCloseTo(3.17, 1);
  });

  it('daily가 없으면 일몰까지 남은 시간은 undefined다', () => {
    const { current, hourly } = parseWeather(makeForecast('2026-10-06T16:30'), AIR);
    expect(current.hoursUntilSunset).toBeUndefined();
    expect(hourly[15].hoursUntilSunset).toBeUndefined();
  });

  it('예보 요청에 daily=sunset을 포함한다', () => {
    expect(buildForecastQuery({ lat: 37.5, lon: 127 })).toContain('daily=sunset');
  });

  it('예보 요청에 is_day를 포함한다', () => {
    expect(buildForecastQuery({ lat: 37.5, lon: 127 })).toContain('is_day');
  });

  it('예보 응답 형식이 올바르지 않으면 에러를 던진다', () => {
    const broken = { current: undefined, hourly: undefined } as unknown as ForecastResponse;
    expect(() => parseWeather(broken, AIR)).toThrow();
  });
});
