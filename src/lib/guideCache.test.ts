import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GUIDE_CACHE_PREFIX, GUIDE_CACHE_TTL_MS } from '../constants/api';
import { DUMMY_CURRENT_WEATHER } from '../data/dummyWeather';
import type { AiGuide, GuideRequest } from '../types';
import { readGuideCache, writeGuideCache } from './guideCache';

const BASE_TIME = 1_000_000;

const REQUEST: GuideRequest = {
  activityLabel: '러닝',
  offset: -2,
  constraintLabels: ['무릎 문제'],
  weather: DUMMY_CURRENT_WEATHER,
  feltTemp: 8,
  score: 72,
  level: 'good',
  location: '서울 강남구',
};

const GUIDE: AiGuide = {
  guideMessage: '러닝하기 좋은 날씨예요.',
  activityTips: ['수분 챙기기'],
  warningLevel: 'good',
  goOrNotEmoji: '✅',
  detailedReason: '바람이 약해요.',
};

/** 테스트용 메모리 LocalStorage */
function stubStorage(): Map<string, string> {
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    get length() {
      return store.size;
    },
    key: (i: number) => [...store.keys()][i] ?? null,
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });
  return store;
}

describe('guideCache', () => {
  let store: Map<string, string>;
  beforeEach(() => {
    store = stubStorage();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('저장한 가이드를 유효 시간 안에 다시 읽는다', () => {
    writeGuideCache(REQUEST, GUIDE, BASE_TIME);
    expect(readGuideCache(REQUEST, BASE_TIME + GUIDE_CACHE_TTL_MS)).toEqual(GUIDE);
  });

  it('유효 시간이 지나면 null', () => {
    writeGuideCache(REQUEST, GUIDE, BASE_TIME);
    expect(readGuideCache(REQUEST, BASE_TIME + GUIDE_CACHE_TTL_MS + 1)).toBeNull();
  });

  it('활동이나 날씨가 다르면 다른 캐시다', () => {
    writeGuideCache(REQUEST, GUIDE, BASE_TIME);
    const other = { ...REQUEST, activityLabel: '등산' };
    const windy = { ...REQUEST, weather: { ...REQUEST.weather, windSpeed: 20 } };
    expect(readGuideCache(other, BASE_TIME)).toBeNull();
    expect(readGuideCache(windy, BASE_TIME)).toBeNull();
  });

  it('저장할 때 만료된 가이드 캐시는 지운다', () => {
    writeGuideCache(REQUEST, GUIDE, BASE_TIME);
    const later = BASE_TIME + GUIDE_CACHE_TTL_MS + 1;
    writeGuideCache({ ...REQUEST, activityLabel: '등산' }, GUIDE, later);
    const keys = [...store.keys()].filter((k) => k.startsWith(GUIDE_CACHE_PREFIX));
    expect(keys).toHaveLength(1);
  });

  it('다른 접두어의 저장 값은 건드리지 않는다', () => {
    store.set('runsmart:weather:37.50,127.03', '{}');
    writeGuideCache(REQUEST, GUIDE, BASE_TIME);
    expect(store.has('runsmart:weather:37.50,127.03')).toBe(true);
  });

  it('손상된 캐시는 null', () => {
    writeGuideCache(REQUEST, GUIDE, BASE_TIME);
    store.set([...store.keys()][0], '{broken');
    expect(readGuideCache(REQUEST, BASE_TIME)).toBeNull();
  });

  it('LocalStorage를 쓸 수 없어도 에러 없이 동작한다', () => {
    vi.stubGlobal('localStorage', {
      get length(): number {
        throw new Error('blocked');
      },
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    });
    expect(() => writeGuideCache(REQUEST, GUIDE)).not.toThrow();
    expect(readGuideCache(REQUEST)).toBeNull();
  });
});
