import {
  COORD_CACHE_DIGITS,
  WEATHER_CACHE_PREFIX,
  WEATHER_CACHE_TTL_MS,
  type Coords,
} from '../constants/api';
import { logger } from './logger';
import type { WeatherResult } from './openMeteo';

/** 저장되는 캐시 형태 */
interface CachedWeather {
  savedAt: number;
  data: WeatherResult;
}

/** 좌표를 반올림해 캐시 키를 만든다. (가까운 위치는 같은 캐시를 쓴다) */
function cacheKey(coords: Coords): string {
  const lat = coords.lat.toFixed(COORD_CACHE_DIGITS);
  const lon = coords.lon.toFixed(COORD_CACHE_DIGITS);
  return `${WEATHER_CACHE_PREFIX}${lat},${lon}`;
}

/**
 * 유효한 날씨 캐시를 읽는다.
 * LocalStorage를 쓸 수 없거나 만료·손상된 경우 null.
 * @param coords 좌표
 * @param now 현재 시각(ms), 테스트용
 */
export function readWeatherCache(
  coords: Coords,
  now: number = Date.now(),
): WeatherResult | null {
  try {
    const raw = localStorage.getItem(cacheKey(coords));
    if (!raw) return null;
    const cached = JSON.parse(raw) as CachedWeather;
    if (now - cached.savedAt > WEATHER_CACHE_TTL_MS) return null;
    return cached.data;
  } catch (e) {
    logger.warn('날씨 캐시 읽기 실패', e);
    return null;
  }
}

/**
 * 날씨를 캐시에 저장한다. 실패해도 동작에는 영향이 없다.
 * @param coords 좌표
 * @param data 저장할 날씨
 * @param now 현재 시각(ms), 테스트용
 */
export function writeWeatherCache(
  coords: Coords,
  data: WeatherResult,
  now: number = Date.now(),
): void {
  try {
    const value: CachedWeather = { savedAt: now, data };
    localStorage.setItem(cacheKey(coords), JSON.stringify(value));
  } catch (e) {
    logger.warn('날씨 캐시 저장 실패', e);
  }
}
