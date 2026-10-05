import type { OutfitItem } from '../types';

/** 복장 추천 기준 체감온도(°C) */
const COLD_MAX = 5;
const COOL_MAX = 12;
const MILD_MAX = 20;

/** 비가 올 때 우산/방수 판단 기준(mm) */
const RAIN_GEAR_MIN = 0.1;

/**
 * 개인 체감온도에 맞는 복장을 추천한다. (M1은 이모지 기반)
 * @param feelsLike 개인 체감온도
 * @param precipitation 강수량(mm)
 */
export function recommendOutfit(
  feelsLike: number,
  precipitation: number,
): OutfitItem[] {
  const items: OutfitItem[] = [];
  if (feelsLike <= COLD_MAX) {
    items.push({ emoji: '🧥', label: '패딩/두꺼운 겉옷' });
    items.push({ emoji: '👖', label: '긴바지' });
  } else if (feelsLike <= COOL_MAX) {
    items.push({ emoji: '👕', label: '긴팔 상의' });
    items.push({ emoji: '🧥', label: '바람막이' });
    items.push({ emoji: '👖', label: '긴바지' });
  } else if (feelsLike <= MILD_MAX) {
    items.push({ emoji: '👕', label: '반팔 상의' });
    items.push({ emoji: '🩳', label: '반바지' });
  } else {
    items.push({ emoji: '🎽', label: '민소매/얇은 반팔' });
    items.push({ emoji: '🩳', label: '반바지' });
  }
  items.push({ emoji: '👟', label: '운동화' });
  if (precipitation >= RAIN_GEAR_MIN) items.push({ emoji: '☔', label: '우비/방수' });
  return items;
}
