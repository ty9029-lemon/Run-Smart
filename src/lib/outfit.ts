import type { Activity, OutfitItem } from '../types';

/** 비가 올 때 우산/방수 판단 기준(mm) */
const RAIN_GEAR_MIN = 0.1;

/** 운동 중 체온 상승을 반영해 더하는 체감온도 보정(°C) */
const EXERCISE_WARMUP_OFFSET = 6;
/** 체온이 많이 오르는 활동 (더 가볍게 입는다) */
const WARMUP_ACTIVITIES: Activity[] = ['running', 'cycling'];

/** 복장 구간별 체감온도 상한(°C, 이하) */
const COLD_MAX = 4;
const COOL_MAX = 11;
const CHILLY_MAX = 16;
const MILD_MAX = 22;
const WARM_MAX = 27;

/** 체감온도 구간별 기본 복장 (상한 오름차순, 마지막은 상한 없음) */
const OUTFIT_TIERS: { max: number; items: OutfitItem[] }[] = [
  {
    max: COLD_MAX,
    items: [
      { emoji: '🧥', label: '패딩/두꺼운 겉옷' },
      { emoji: '👖', label: '긴바지' },
    ],
  },
  {
    max: COOL_MAX,
    items: [
      { emoji: '👕', label: '긴팔 상의' },
      { emoji: '🧥', label: '바람막이/재킷' },
      { emoji: '👖', label: '긴바지' },
    ],
  },
  {
    max: CHILLY_MAX,
    items: [
      { emoji: '👕', label: '긴팔 상의' },
      { emoji: '🧥', label: '가디건/얇은 겉옷' },
      { emoji: '👖', label: '긴바지' },
    ],
  },
  {
    max: MILD_MAX,
    items: [
      { emoji: '👕', label: '얇은 긴팔 상의' },
      { emoji: '👖', label: '긴바지' },
    ],
  },
  {
    max: WARM_MAX,
    items: [
      { emoji: '👕', label: '반팔 상의' },
      { emoji: '🩳', label: '반바지' },
    ],
  },
  {
    max: Infinity,
    items: [
      { emoji: '🎽', label: '민소매/얇은 반팔' },
      { emoji: '🩳', label: '반바지' },
    ],
  },
];

/**
 * 개인 체감온도와 활동에 맞는 복장을 추천한다. (M1은 이모지 기반)
 * 러닝·자전거는 운동 중 체온이 오르므로 같은 체감온도에서 더 가볍게 추천한다.
 * @param feelsLike 개인 체감온도
 * @param precipitation 강수량(mm)
 * @param activity 활동
 */
export function recommendOutfit(
  feelsLike: number,
  precipitation: number,
  activity: Activity,
): OutfitItem[] {
  const warmup = WARMUP_ACTIVITIES.includes(activity) ? EXERCISE_WARMUP_OFFSET : 0;
  const tier = OUTFIT_TIERS.find((t) => feelsLike + warmup <= t.max) ?? OUTFIT_TIERS[0];
  const items: OutfitItem[] = [...tier.items, { emoji: '👟', label: '운동화' }];
  if (precipitation >= RAIN_GEAR_MIN) items.push({ emoji: '☔', label: '우비/방수' });
  return items;
}
