import { GUIDE_CACHE_PREFIX, GUIDE_CACHE_TTL_MS } from '../constants/api';
import type { AiGuide, GuideRequest } from '../types';
import { logger } from './logger';

/** 저장되는 캐시 형태 */
interface CachedGuide {
  savedAt: number;
  data: AiGuide;
}

/** 요청 본문 전체를 키로 쓴다. 활동·보정값·제약·날씨가 같을 때만 같은 키가 된다. */
function cacheKey(request: GuideRequest): string {
  return `${GUIDE_CACHE_PREFIX}${JSON.stringify(request)}`;
}

/** 만료된 가이드 캐시를 지운다. (쌓이는 것을 막는다) */
function removeExpired(now: number): void {
  const expired: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key?.startsWith(GUIDE_CACHE_PREFIX)) continue;
    try {
      const cached = JSON.parse(localStorage.getItem(key) ?? '') as CachedGuide;
      if (now - cached.savedAt > GUIDE_CACHE_TTL_MS) expired.push(key);
    } catch {
      expired.push(key);
    }
  }
  expired.forEach((key) => localStorage.removeItem(key));
}

/**
 * 유효한 가이드 캐시를 읽는다.
 * LocalStorage를 쓸 수 없거나 만료·손상된 경우 null.
 * @param request 가이드 요청
 * @param now 현재 시각(ms), 테스트용
 */
export function readGuideCache(
  request: GuideRequest,
  now: number = Date.now(),
): AiGuide | null {
  try {
    const raw = localStorage.getItem(cacheKey(request));
    if (!raw) return null;
    const cached = JSON.parse(raw) as CachedGuide;
    if (now - cached.savedAt > GUIDE_CACHE_TTL_MS) return null;
    return cached.data;
  } catch (e) {
    logger.warn('가이드 캐시 읽기 실패', e);
    return null;
  }
}

/**
 * 가이드를 캐시에 저장한다. 실패해도 동작에는 영향이 없다.
 * @param request 가이드 요청
 * @param data 저장할 가이드
 * @param now 현재 시각(ms), 테스트용
 */
export function writeGuideCache(
  request: GuideRequest,
  data: AiGuide,
  now: number = Date.now(),
): void {
  try {
    removeExpired(now);
    const value: CachedGuide = { savedAt: now, data };
    localStorage.setItem(cacheKey(request), JSON.stringify(value));
  } catch (e) {
    logger.warn('가이드 캐시 저장 실패', e);
  }
}
