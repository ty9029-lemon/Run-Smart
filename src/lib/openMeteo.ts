import { HOURS_IN_DAY } from '../constants/thresholds';
import type { Coords } from '../constants/api';
import type { HourlyWeather, Weather } from '../types';

/** 날씨 조회 결과 */
export interface WeatherResult {
  current: Weather;
  hourly: HourlyWeather[];
}

/** Open-Meteo 예보 응답 중 사용하는 부분 */
export interface ForecastResponse {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    precipitation: number;
    weather_code: number;
    is_day?: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    wind_speed_10m: number[];
    precipitation: number[];
    weather_code: number[];
    uv_index: number[];
    is_day?: number[];
  };
}

/** Open-Meteo 대기질 응답 중 사용하는 부분 */
export interface AirResponse {
  hourly: { time: string[]; pm10: (number | null)[] };
}

/** WMO 날씨 코드 → 한글 날씨 (구간 상한 기준, 오름차순) */
const CONDITION_RANGES: { max: number; label: string }[] = [
  { max: 0, label: '맑음' },
  { max: 2, label: '구름 조금' },
  { max: 3, label: '흐림' },
  { max: 48, label: '안개' },
  { max: 57, label: '이슬비' },
  { max: 67, label: '비' },
  { max: 77, label: '눈' },
  { max: 82, label: '소나기' },
  { max: 86, label: '눈 소나기' },
  { max: 99, label: '뇌우' },
];
/** 알 수 없는 날씨 코드일 때 표기 */
const UNKNOWN_CONDITION = '알 수 없음';

/**
 * WMO 날씨 코드를 한글 날씨 문구로 바꾼다.
 * @param code WMO weather_code
 */
export function weatherCodeToCondition(code: number): string {
  return CONDITION_RANGES.find((r) => code <= r.max)?.label ?? UNKNOWN_CONDITION;
}

/**
 * 예보 요청 URL 쿼리를 만든다. (오늘 0~23시, m/s, 현지 시간대)
 * @param coords 좌표
 */
export function buildForecastQuery(coords: Coords): string {
  const hourly = [
    'temperature_2m',
    'relative_humidity_2m',
    'wind_speed_10m',
    'precipitation',
    'weather_code',
    'uv_index',
    'is_day',
  ].join(',');
  const current = [
    'temperature_2m',
    'relative_humidity_2m',
    'wind_speed_10m',
    'precipitation',
    'weather_code',
    'is_day',
  ].join(',');
  return new URLSearchParams({
    latitude: String(coords.lat),
    longitude: String(coords.lon),
    current,
    hourly,
    wind_speed_unit: 'ms',
    timezone: 'auto',
    forecast_days: '1',
  }).toString();
}

/**
 * 대기질 요청 URL 쿼리를 만든다.
 * @param coords 좌표
 */
export function buildAirQuery(coords: Coords): string {
  return new URLSearchParams({
    latitude: String(coords.lat),
    longitude: String(coords.lon),
    hourly: 'pm10',
    timezone: 'auto',
    forecast_days: '1',
  }).toString();
}

/** "2026-10-06T14:00" 형태에서 시(hour)를 꺼낸다. */
function hourOf(isoLocal: string): number {
  return Number(isoLocal.slice(11, 13));
}

/** Open-Meteo의 is_day(1=낮, 0=밤)를 boolean으로 바꾼다. 값이 없으면 낮으로 본다. */
function toIsDay(value: number | undefined): boolean {
  return value !== 0;
}

/** 소수 첫째 자리로 반올림 */
function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** 대기질 응답에서 시간대별 PM10 맵을 만든다. (값이 없는 시간은 제외) */
function buildPm10Map(air: AirResponse): Map<number, number> {
  const map = new Map<number, number>();
  air.hourly?.time?.forEach((t, i) => {
    const value = air.hourly.pm10[i];
    if (value !== null && value !== undefined) map.set(hourOf(t), value);
  });
  return map;
}

/** 예보 응답의 시간대별 배열을 앱의 시간대별 날씨로 변환한다. */
function toHourly(h: ForecastResponse['hourly'], pm10ByHour: Map<number, number>) {
  return h.time.slice(0, HOURS_IN_DAY).map((t, i): HourlyWeather => {
    const hour = hourOf(t);
    return {
      hour,
      temp: round1(h.temperature_2m[i]),
      humidity: Math.round(h.relative_humidity_2m[i]),
      windSpeed: round1(h.wind_speed_10m[i]),
      precipitation: round1(h.precipitation[i]),
      condition: weatherCodeToCondition(h.weather_code[i]),
      pm10: Math.round(pm10ByHour.get(hour) ?? 0),
      uvIndex: round1(h.uv_index[i]),
      isDay: toIsDay(h.is_day?.[i]),
    };
  });
}

/**
 * 예보·대기질 응답을 앱의 날씨 형태로 변환한다.
 * 현재 날씨의 자외선·미세먼지는 현재 시각이 속한 시간대 값을 쓴다.
 * @param forecast 예보 응답
 * @param air 대기질 응답
 * @throws 응답 형식이 맞지 않으면 에러
 */
export function parseWeather(forecast: ForecastResponse, air: AirResponse): WeatherResult {
  const { hourly: h, current: c } = forecast;
  if (!h?.time?.length || !c) throw new Error('예보 응답 형식이 올바르지 않아요.');
  const hourly = toHourly(h, buildPm10Map(air));
  const slot = hourly.find((x) => x.hour === hourOf(c.time));
  const current: Weather = {
    temp: round1(c.temperature_2m),
    humidity: Math.round(c.relative_humidity_2m),
    windSpeed: round1(c.wind_speed_10m),
    precipitation: round1(c.precipitation),
    condition: weatherCodeToCondition(c.weather_code),
    pm10: slot?.pm10 ?? 0,
    uvIndex: slot?.uvIndex ?? 0,
    isDay: toIsDay(c.is_day),
  };
  return { current, hourly };
}
