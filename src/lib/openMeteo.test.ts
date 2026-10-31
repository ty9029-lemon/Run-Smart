import { describe, expect, it } from 'vitest';
import {
  applyAirObservation,
  applyObservation,
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
      pm10Source: 'model',
      uvIndex: 14,
      isDay: true,
      hour: 14,
    });
  });

  it('시간대별 날씨는 오늘·내일 48개로 변환하고 PM10을 날짜별로 구분한다', () => {
    const { hourly } = parseWeather(makeForecast('2026-10-06T00:00'), AIR);
    expect(hourly).toHaveLength(48);
    expect(hourly[5]).toMatchObject({ hour: 5, pm10: 10, condition: '맑음' });
    expect(hourly[29]).toMatchObject({ hour: 5, pm10: 58 });
  });

  it('대기질 응답이 비어 있어도 날씨는 변환하고, PM10은 0으로 두되 값 없음으로 표시한다', () => {
    const empty: AirResponse = { hourly: { time: [], pm10: [] } };
    const { current, hourly } = parseWeather(makeForecast('2026-10-06T09:00'), empty);
    expect(current.pm10).toBe(0);
    expect(current.pm10Source).toBe('none');
    expect(hourly.every((h) => h.pm10 === 0 && h.pm10Source === 'none')).toBe(true);
  });

  it('PM10 값이 null인 시간은 값 없음으로 표시한다', () => {
    const air: AirResponse = { hourly: { time: TIMES, pm10: TIMES.map(() => null) } };
    const { current } = parseWeather(makeForecast('2026-10-06T09:00'), air);
    expect(current.pm10).toBe(0);
    expect(current.pm10Source).toBe('none');
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

describe('applyObservation', () => {
  const base = parseWeather(makeForecast('2026-10-06T14:15'), AIR);

  it('기온·습도·풍속을 실측값으로 바꾸고 나머지는 유지한다', () => {
    const merged = applyObservation(base, { temp: 19.44, humidity: 72.4, windSpeed: 1.84 });
    expect(merged.current.temp).toBe(19.4);
    expect(merged.current.humidity).toBe(72);
    expect(merged.current.windSpeed).toBe(1.8);
    expect(merged.current.condition).toBe(base.current.condition);
    expect(merged.current.uvIndex).toBe(base.current.uvIndex);
    expect(merged.hourly).toBe(base.hourly);
  });

  it('습도·풍속이 없으면 예보 값을 유지한다', () => {
    const merged = applyObservation(base, { temp: 15, humidity: null, windSpeed: null });
    expect(merged.current.temp).toBe(15);
    expect(merged.current.humidity).toBe(base.current.humidity);
    expect(merged.current.windSpeed).toBe(base.current.windSpeed);
  });

  it('실황이 없으면 원본을 그대로 돌려준다', () => {
    expect(applyObservation(base, null)).toBe(base);
  });
});

describe('applyAirObservation', () => {
  const base = parseWeather(makeForecast('2026-10-06T14:15'), AIR);

  it('현재 미세먼지를 측정소 실측으로 바꾸고 출처를 표시한다', () => {
    const merged = applyAirObservation(base, { pm10: 94.4, pm25: 35.2 });
    expect(merged.current.pm10).toBe(94);
    expect(merged.current.pm25).toBe(35);
    expect(merged.current.pm10Source).toBe('observed');
    expect(merged.current.temp).toBe(base.current.temp);
    expect(merged.hourly).toBe(base.hourly);
  });

  it('PM2.5가 없으면 값을 비워 둔다', () => {
    const merged = applyAirObservation(base, { pm10: 101, pm25: null });
    expect(merged.current.pm10).toBe(101);
    expect(merged.current.pm25).toBeUndefined();
  });

  it('실측이 없으면 모델 값과 출처를 그대로 둔다', () => {
    const merged = applyAirObservation(base, null);
    expect(merged.current.pm10).toBe(base.current.pm10);
    expect(merged.current.pm10Source).toBe('model');
  });

  it('실측도 모델 값도 없으면 값 없음 표시를 유지한다', () => {
    const empty = parseWeather(makeForecast('2026-10-06T14:15'), { hourly: { time: [], pm10: [] } });
    expect(applyAirObservation(empty, null).current.pm10Source).toBe('none');
    expect(applyAirObservation(empty, { pm10: 94, pm25: null }).current.pm10Source).toBe('observed');
  });
});
