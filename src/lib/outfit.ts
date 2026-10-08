import { OUTFIT_CATEGORY_ORDER } from '../constants/outfitCategories';
import type { Activity, OutfitCategory, OutfitItem, Weather } from '../types';
import { applyOutfitConditions } from './outfitConditions';
import { BASE_ITEMS_BY_ACTIVITY, TIERS_BY_ACTIVITY } from './outfitTiers';

/** 운동 중 체온 상승을 반영해 더하는 체감온도 보정(°C) */
const EXERCISE_WARMUP_OFFSET = 6;
/** 체온이 많이 오르는 활동 (더 가볍게 입는다) */
const WARMUP_ACTIVITIES: Activity[] = ['running', 'cycling'];

/**
 * 개인 체감온도·날씨·활동에 맞는 복장을 추천한다. (M1은 이모지 기반)
 * 러닝·자전거는 운동 중 체온이 오르므로 같은 체감온도에서 더 가볍게 추천한다.
 * 활동마다 전용 구간표를 쓰고, 바람·비·어두움·자외선 같은 날씨 조건에 따라 장비를 더한다.
 * @param feelsLike 개인 체감온도
 * @param weather 현재 날씨
 * @param activity 활동
 */
export function recommendOutfit(
  feelsLike: number,
  weather: Weather,
  activity: Activity,
): OutfitItem[] {
  const warmup = WARMUP_ACTIVITIES.includes(activity) ? EXERCISE_WARMUP_OFFSET : 0;
  const tiers = TIERS_BY_ACTIVITY[activity];
  const tier = tiers.find((t) => feelsLike + warmup <= t.max) ?? tiers[0];
  const items = [...tier.items, ...BASE_ITEMS_BY_ACTIVITY[activity]];
  return applyOutfitConditions(items, weather, activity, feelsLike);
}

/**
 * 복장 항목을 분류별로 묶는다. 표시 순서는 OUTFIT_CATEGORY_ORDER를 따르고 빈 분류는 뺀다.
 * @param items 복장 항목
 */
export function groupOutfitByCategory(
  items: OutfitItem[],
): { category: OutfitCategory; items: OutfitItem[] }[] {
  return OUTFIT_CATEGORY_ORDER.map((category) => ({
    category,
    items: items.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);
}
