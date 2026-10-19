import {
  formatOutfitBase,
  MAX_OUTFIT_BASE_LABELS,
  MAX_OUTFIT_EXTRA_REASONS,
  OUTFIT_REASON_MESSAGES,
} from '../constants/outfitReasons';
import {
  OUTFIT_RAIN_MIN,
  OUTFIT_STRONG_WIND_MIN,
  OUTFIT_UV_HIGH_MIN,
} from '../constants/thresholds';
import type { Activity, OutfitCategory, OutfitItem, Weather } from '../types';
import { isWarmupActivity } from './outfit';
import { isDarkSoon, needsSunglasses } from './outfitConditions';

/** 복장 근거: 기본 문장과 조건 때문에 더해진 장비 설명 */
export interface OutfitReason {
  /** 체감온도에 맞춘 기본 차림 설명 */
  base: string;
  /** 비·바람·자외선 같은 조건 때문에 더해진 장비 설명 (없으면 빈 배열) */
  extras: string[];
}

/** 조건 근거 규칙: 날씨 조건이 맞고 그 장비가 복장에 실제로 있을 때만 설명한다. */
interface ExtraRule {
  text: string;
  when: (weather: Weather) => boolean;
  matches: (item: OutfitItem) => boolean;
}

const hasIcon =
  (...icons: string[]) =>
  (item: OutfitItem) =>
    icons.includes(item.icon);
const hasLabel =
  (...labels: string[]) =>
  (item: OutfitItem) =>
    labels.includes(item.label);

/** 우선순위 순서의 조건 근거 규칙 (큰 영향을 주는 조건이 먼저) */
const EXTRA_RULES: ExtraRule[] = [
  {
    text: OUTFIT_REASON_MESSAGES.rain,
    when: (w) => w.precipitation >= OUTFIT_RAIN_MIN,
    matches: hasIcon('raincoat', 'fender', 'shoeCover', 'rainCover'),
  },
  {
    text: OUTFIT_REASON_MESSAGES.wind,
    when: (w) => w.windSpeed >= OUTFIT_STRONG_WIND_MIN,
    matches: hasLabel('경량 바람막이', '윈드 재킷', '윈드 베스트', '소프트쉘'),
  },
  {
    text: OUTFIT_REASON_MESSAGES.dark,
    when: isDarkSoon,
    matches: (item) => item.icon === 'headlamp' || item.label === '반사 조끼',
  },
  {
    text: OUTFIT_REASON_MESSAGES.uv,
    when: (w) => w.uvIndex >= OUTFIT_UV_HIGH_MIN,
    matches: hasIcon('cap', 'wideHat', 'sunscreen', 'sunglasses'),
  },
  {
    text: OUTFIT_REASON_MESSAGES.glare,
    when: (w) => w.uvIndex < OUTFIT_UV_HIGH_MIN && needsSunglasses(w),
    matches: hasIcon('sunglasses'),
  },
  { text: OUTFIT_REASON_MESSAGES.dust, when: () => true, matches: hasIcon('mask') },
  { text: OUTFIT_REASON_MESSAGES.coldAir, when: () => true, matches: hasIcon('tissue') },
  { text: OUTFIT_REASON_MESSAGES.knee, when: () => true, matches: hasIcon('kneeBrace') },
  { text: OUTFIT_REASON_MESSAGES.ice, when: () => true, matches: hasIcon('crampons') },
];

/** 기본 근거에 이름을 보여줄 분류 */
const BASE_CATEGORIES: OutfitCategory[] = ['top', 'outer', 'bottom'];

/**
 * 조건 때문에 더해진 장비를 "비가 와서 방수 바람막이" 같은 문장으로 만든다.
 * @param outfit 추천된 복장
 * @param weather 현재 날씨
 */
function buildExtras(outfit: OutfitItem[], weather: Weather): { text: string; labels: string[] }[] {
  return EXTRA_RULES.filter((rule) => rule.when(weather))
    .map((rule) => ({ text: rule.text, labels: outfit.filter(rule.matches).map((i) => i.label) }))
    .filter((extra) => extra.labels.length > 0)
    .slice(0, MAX_OUTFIT_EXTRA_REASONS);
}

/**
 * 복장을 왜 이렇게 추천했는지 근거를 만든다. 추천 결과(outfit)에 실제로 있는 항목만 설명한다.
 * @param feelsLike 개인 체감온도
 * @param weather 현재 날씨
 * @param activity 활동
 * @param outfit recommendOutfit이 만든 복장
 */
export function buildOutfitReason(
  feelsLike: number,
  weather: Weather,
  activity: Activity,
  outfit: OutfitItem[],
): OutfitReason {
  const extras = buildExtras(outfit, weather);
  const explained = new Set(extras.flatMap((extra) => extra.labels));
  const baseLabels = outfit
    .filter((item) => BASE_CATEGORIES.includes(item.category) && !explained.has(item.label))
    .map((item) => item.label)
    .slice(0, MAX_OUTFIT_BASE_LABELS);
  const base = formatOutfitBase(feelsLike, baseLabels);
  return {
    base: isWarmupActivity(activity) ? `${base} ${OUTFIT_REASON_MESSAGES.warmup}` : base,
    extras: extras.map((extra) => `${extra.text} ${extra.labels.join('·')}`),
  };
}
