import {
  KMA_NOW_API_PATH,
  KMA_NOW_TIMEOUT_MS,
  OPEN_METEO_AIR_URL,
  OPEN_METEO_FORECAST_URL,
  WEATHER_TIMEOUT_MS,
  type Coords,
} from '../constants/api';
import { logger } from '../lib/logger';
import {
  applyObservation,
  buildAirQuery,
  buildForecastQuery,
  parseWeather,
  type AirResponse,
  type ForecastResponse,
  type Observation,
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

/** 기상청 실황(실제 관측 기온)을 요청한다. 실패하면 null이며, 그때는 예보 값을 쓴다. */
async function fetchObservation(coords: Coords): Promise<Observation | null> {
  const query = new URLSearchParams({ lat: String(coords.lat), lon: String(coords.lon) });
  try {
    const res = await fetch(`${KMA_NOW_API_PATH}?${query}`, {
      signal: AbortSignal.timeout(KMA_NOW_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return (await res.json()) as Observation;
  } catch (e) {
    logger.warn('기상청 실황 조회 실패, 예보 값을 사용합니다', e);
    return null;
  }
}

/**
 * 날씨를 조회한다. 1시간 이내 캐시가 있으면 그대로 쓴다.
 * 현재 기온·습도·풍속은 기상청 실황(실측)으로 바꾸고, 실패하면 예보 값을 쓴다.
 * 대기질(PM10) 조회가 실패해도 날씨는 보여주기 위해 PM10을 0으로 둔다.
 * @param coords 조회할 좌표
 */
export async function fetchWeather(coords: Coords): Promise<WeatherResult> {
  const cached = readWeatherCache(coords);
  if (cached) return cached;
  const [forecast, air, observation] = await Promise.all([
    getJson<ForecastResponse>(`${OPEN_METEO_FORECAST_URL}?${buildForecastQuery(coords)}`),
    getJson<AirResponse>(`${OPEN_METEO_AIR_URL}?${buildAirQuery(coords)}`).catch(
      (): AirResponse => ({ hourly: { time: [], pm10: [] } }),
    ),
    fetchObservation(coords),
  ]);
  const result = applyObservation(parseWeather(forecast, air), observation);
  writeWeatherCache(coords, result);
  return result;
}
