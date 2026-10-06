import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WEATHER_CACHE_TTL_MS } from '../constants/api';
import { DUMMY_CURRENT_WEATHER, DUMMY_HOURLY } from '../data/dummyWeather';
import { readWeatherCache, writeWeatherCache } from './weatherCache';

const COORDS = { lat: 37.4979, lon: 127.0276 };
const DATA = { current: DUMMY_CURRENT_WEATHER, hourly: DUMMY_HOURLY };
const BASE_TIME = 1_000_000;

/** 테스트용 메모리 LocalStorage */
function stubStorage(): Map<string, string> {
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  });
  return store;
}

describe('weatherCache', () => {
  beforeEach(() => void stubStorage());
  afterEach(() => vi.unstubAllGlobals());

  it('저장한 날씨를 유효 시간 안에 다시 읽는다', () => {
    writeWeatherCache(COORDS, DATA, BASE_TIME);
    expect(readWeatherCache(COORDS, BASE_TIME + WEATHER_CACHE_TTL_MS)).toEqual(DATA);
  });

  it('유효 시간이 지나면 null', () => {
    writeWeatherCache(COORDS, DATA, BASE_TIME);
    expect(readWeatherCache(COORDS, BASE_TIME + WEATHER_CACHE_TTL_MS + 1)).toBeNull();
  });

  it('가까운 좌표는 같은 캐시를 쓴다', () => {
    writeWeatherCache(COORDS, DATA, BASE_TIME);
    const nearby = { lat: COORDS.lat + 0.001, lon: COORDS.lon - 0.001 };
    expect(readWeatherCache(nearby, BASE_TIME)).toEqual(DATA);
  });

  it('손상된 캐시는 null', () => {
    const store = stubStorage();
    writeWeatherCache(COORDS, DATA, BASE_TIME);
    store.set([...store.keys()][0], '{broken');
    expect(readWeatherCache(COORDS, BASE_TIME)).toBeNull();
  });

  it('LocalStorage를 쓸 수 없어도 에러 없이 동작한다', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    });
    expect(() => writeWeatherCache(COORDS, DATA)).not.toThrow();
    expect(readWeatherCache(COORDS)).toBeNull();
  });
});
