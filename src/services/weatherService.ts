import {
  OPEN_METEO_AIR_URL,
  OPEN_METEO_FORECAST_URL,
  WEATHER_TIMEOUT_MS,
  type Coords,
} from '../constants/api';
import {
  buildAirQuery,
  buildForecastQuery,
  parseWeather,
  type AirResponse,
  type ForecastResponse,
  type WeatherResult,
} from '../lib/openMeteo';
import { readWeatherCache, writeWeatherCache } from '../lib/weatherCache';

export type { WeatherResult };

/** JSON을 요청한다. 제한 시간을 넘기거나 응답이 실패면 에러. */
async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { signal: AbortSignal.timeout(WEATHER_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`날씨 요청 실패: ${res.status}`);
  return (await res.json()) as T;
}

/**
 * 날씨를 조회한다. 1시간 이내 캐시가 있으면 그대로 쓴다.
 * 대기질(PM10) 조회가 실패해도 날씨는 보여주기 위해 PM10을 0으로 둔다.
 * @param coords 조회할 좌표
 */
export async function fetchWeather(coords: Coords): Promise<WeatherResult> {
  const cached = readWeatherCache(coords);
  if (cached) return cached;
  const [forecast, air] = await Promise.all([
    getJson<ForecastResponse>(`${OPEN_METEO_FORECAST_URL}?${buildForecastQuery(coords)}`),
    getJson<AirResponse>(`${OPEN_METEO_AIR_URL}?${buildAirQuery(coords)}`).catch(
      (): AirResponse => ({ hourly: { time: [], pm10: [] } }),
    ),
  ]);
  const result = parseWeather(forecast, air);
  writeWeatherCache(coords, result);
  return result;
}
