import {
  OUTFIT_DARK_SOON_HOURS,
  OUTFIT_ICE_RISK_MAX,
  OUTFIT_RAIN_MIN,
  OUTFIT_STRONG_WIND_MIN,
  OUTFIT_UV_HIGH_MIN,
} from '../constants/thresholds';
import type { Activity, Constraint, OutfitItem, Weather } from '../types';
import { shouldRecommendMask } from './airGrade';
import { outfitItem } from './outfitTiers';

/** 날씨 조건 때문에 더하고(add) 뺄(remove, 라벨 기준) 항목 */
interface ConditionGear {
  add: OutfitItem[];
  remove?: string[];
}

/** 비: 활동별 방수 장비 (기존 보온 겉옷은 방수 겉옷으로 바꾼다) */
const RAIN_GEAR: Record<Activity, ConditionGear> = {
  walking: { add: [outfitItem('outer', 'raincoat', '우비/방수')] },
  running: {
    add: [outfitItem('outer', 'raincoat', '방수 바람막이')],
    remove: ['경량 바람막이'],
  },
  cycling: {
    add: [
      outfitItem('outer', 'raincoat', '방수 재킷'),
      outfitItem('gear', 'fender', '흙받이'),
      outfitItem('gear', 'shoeCover', '방수 슈커버'),
    ],
    remove: ['윈드 재킷', '윈드 베스트'],
  },
  hiking: {
    add: [outfitItem('outer', 'raincoat', '하드쉘'), outfitItem('gear', 'rainCover', '배낭 레인커버')],
    remove: ['소프트쉘'],
  },
};

/** 강풍: 방풍 겉옷이 없을 때 더하는 겉옷 (산책은 해당 없음) */
const WIND_LAYER: Partial<Record<Activity, OutfitItem>> = {
  running: outfitItem('outer', 'jacket', '경량 바람막이'),
  cycling: outfitItem('outer', 'vest', '윈드 베스트'),
  hiking: outfitItem('outer', 'jacket', '소프트쉘'),
};

/** 이미 바람을 막아 주는 겉옷 라벨 (이 중 하나가 있으면 방풍 겉옷을 또 더하지 않는다) */
const WINDPROOF_LABELS = ['경량 바람막이', '윈드 재킷', '윈드 베스트', '소프트쉘', '하드쉘'];

/** 어두울 때: 눈에 띄는 반사 소재와 조명 */
const DARK_GEAR: Partial<Record<Activity, OutfitItem[]>> = {
  running: [outfitItem('outer', 'vest', '반사 소재 옷')],
  cycling: [outfitItem('outer', 'vest', '반사 조끼'), outfitItem('gear', 'headlamp', '전조등·후미등')],
  hiking: [outfitItem('gear', 'headlamp', '헤드랜턴')],
};

/** 자외선이 강할 때: 모자·선크림 (눈 보호 장비는 SUNGLASSES로 따로 더한다) */
const UV_GEAR: Partial<Record<Activity, OutfitItem[]>> = {
  running: [outfitItem('gear', 'cap', '러닝 캡')],
  cycling: [outfitItem('gear', 'sunscreen', '선크림')],
  hiking: [outfitItem('gear', 'wideHat', '챙 넓은 모자'), outfitItem('gear', 'sunscreen', '선크림')],
};

/** 눈 보호 장비: 운동 활동은 선글라스와 고글을 하나로 통합하고, 산책은 선글라스로만 보여 준다 */
const SUNGLASSES_GEAR: Record<Activity, OutfitItem> = {
  walking: outfitItem('gear', 'sunglasses', '선글라스'),
  running: outfitItem('gear', 'sunglasses', '선글라스/고글'),
  cycling: outfitItem('gear', 'sunglasses', '선글라스/고글'),
  hiking: outfitItem('gear', 'sunglasses', '선글라스/고글'),
};

/** 구름이 없는 맑은 날씨로 보는 날씨 상태 (openMeteo의 weatherCodeToCondition 라벨 기준) */
const CLEAR_SKY_CONDITIONS = ['맑음'];

/** 빙판 대비: 등산 한파 시 챙길 장비 */
const ICE_GEAR = outfitItem('gear', 'crampons', '아이젠');

/** 미세먼지 대비 마스크 (미세먼지 등급과 제약사항 조건을 만족할 때만 더한다) */
const MASK = outfitItem('gear', 'mask', '마스크');

/** 무릎 보호대 (무릎 부담이 적은 산책에는 더하지 않는다) */
const KNEE_BRACE = outfitItem('gear', 'kneeBrace', '무릎보호대');

/** 무릎보호대를 더하지 않는 활동 */
const KNEE_BRACE_EXCLUDED_ACTIVITIES: Activity[] = ['walking'];

/**
 * 무릎보호대가 필요한지 (산책은 제외). 복장·AI 가이드가 함께 쓴다.
 * @param activity 활동
 */
export function isKneeBraceNeeded(activity: Activity): boolean {
  return !KNEE_BRACE_EXCLUDED_ACTIVITIES.includes(activity);
}

/**
 * 미세먼지와 제약사항(예: 무릎 문제)에 맞는 보호 장비를 더한다.
 * 마스크는 미세먼지가 나쁠 때(제약사항과 무관), 또는 천식이면 보통 이상일 때 더한다.
 * 무릎보호대는 무릎 문제를 체크했고 산책이 아닐 때만 더한다.
 * @param items 복장 항목
 * @param constraints 사용자가 체크한 제약사항
 * @param weather 현재 날씨 (미세먼지 판단용)
 * @param activity 활동
 */
export function applyConstraintGear(
  items: OutfitItem[],
  constraints: Constraint[],
  weather: Weather,
  activity: Activity,
): OutfitItem[] {
  const gear: OutfitItem[] = [];
  if (constraints.includes('kneeIssue') && isKneeBraceNeeded(activity)) gear.push(KNEE_BRACE);
  if (shouldRecommendMask(constraints, weather.pm10)) gear.push(MASK);
  return dedupeByLabel([...items, ...gear]);
}

/** 일몰이 임박했거나 이미 어두운지 */
function isDarkSoon(weather: Weather): boolean {
  if (!weather.isDay) return true;
  return weather.hoursUntilSunset !== undefined && weather.hoursUntilSunset <= OUTFIT_DARK_SOON_HOURS;
}

/** 구름 없이 맑은 낮이라 눈부심이 큰지 */
function isSunnyDaytime(weather: Weather): boolean {
  return weather.isDay && CLEAR_SKY_CONDITIONS.includes(weather.condition);
}

/** 자외선이 강하거나 맑은 낮이라 눈 보호 장비가 필요한지 */
function needsSunglasses(weather: Weather): boolean {
  return weather.uvIndex >= OUTFIT_UV_HIGH_MIN || isSunnyDaytime(weather);
}

/** items에서 remove 라벨을 빼고 add를 이어 붙인다 */
function swapItems(items: OutfitItem[], add: OutfitItem[], remove: string[] = []): OutfitItem[] {
  return [...items.filter((item) => !remove.includes(item.label)), ...add];
}

/** 같은 라벨의 항목이 여러 번 들어가지 않게 처음 것만 남긴다 */
function dedupeByLabel(items: OutfitItem[]): OutfitItem[] {
  return items.filter((item, index) => items.findIndex((i) => i.label === item.label) === index);
}

/**
 * 날씨 조건(바람·비·어두움·자외선·맑은 낮·빙판)에 따라 활동 전용 항목을 더하거나 바꾼다.
 * 바람 → 비 순서로 적용해, 비가 오면 방풍 겉옷이 방수 겉옷으로 대체된다.
 * @param items 체감온도 구간으로 정해진 기본 항목
 * @param weather 현재 날씨
 * @param activity 활동
 * @param feelsLike 개인 체감온도
 */
export function applyOutfitConditions(
  items: OutfitItem[],
  weather: Weather,
  activity: Activity,
  feelsLike: number,
): OutfitItem[] {
  let result = items;
  const windLayer = WIND_LAYER[activity];
  const hasWindproof = result.some((item) => WINDPROOF_LABELS.includes(item.label));
  if (windLayer && !hasWindproof && weather.windSpeed >= OUTFIT_STRONG_WIND_MIN) {
    result = swapItems(result, [windLayer]);
  }
  if (weather.precipitation >= OUTFIT_RAIN_MIN) {
    const rain = RAIN_GEAR[activity];
    result = swapItems(result, rain.add, rain.remove);
  }
  if (isDarkSoon(weather)) result = swapItems(result, DARK_GEAR[activity] ?? []);
  if (weather.uvIndex >= OUTFIT_UV_HIGH_MIN) result = swapItems(result, UV_GEAR[activity] ?? []);
  if (needsSunglasses(weather)) result = swapItems(result, [SUNGLASSES_GEAR[activity]]);
  if (activity === 'hiking' && feelsLike <= OUTFIT_ICE_RISK_MAX) result = swapItems(result, [ICE_GEAR]);
  return dedupeByLabel(result);
}
