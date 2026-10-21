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
import { mentionsOutfitItem } from './guideTips';
import { withObjectParticle } from './koreanParticle';
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
    matches: hasIcon('cap', 'sunglasses'),
  },
  { text: OUTFIT_REASON_MESSAGES.dust, when: () => true, matches: hasIcon('mask') },
  { text: OUTFIT_REASON_MESSAGES.coldAir, when: () => true, matches: hasIcon('tissue') },
  { text: OUTFIT_REASON_MESSAGES.ice, when: () => true, matches: hasIcon('crampons') },
];

/** 기본 근거에 이름을 보여줄 분류 */
const BASE_CATEGORIES: OutfitCategory[] = ['top', 'outer', 'bottom'];

/** 조건 하나가 더한 장비: 조건 문구와 그 조건 때문에 복장에 있는 장비들 */
interface ExtraDetail {
  text: string;
  items: OutfitItem[];
}

/**
 * 날씨 조건 때문에 더해진 장비를 조건마다 모은다. (우선순위 순서, 장비가 없는 조건은 뺀다)
 * @param outfit 추천된 복장
 * @param weather 현재 날씨
 */
function collectExtras(outfit: OutfitItem[], weather: Weather): ExtraDetail[] {
  return EXTRA_RULES.filter((rule) => rule.when(weather))
    .map((rule) => ({ text: rule.text, items: outfit.filter(rule.matches) }))
    .filter((extra) => extra.items.length > 0);
}

/**
 * 가이드 문단이 이미 말한 장비를 뺀다. 장비가 모두 빠진 조건은 통째로 뺀다.
 * @param extras 조건별 장비
 * @param guideText 가이드 문단 (없으면 그대로 돌려준다)
 */
function omitMentioned(extras: ExtraDetail[], guideText: string): ExtraDetail[] {
  if (!guideText) return extras;
  return extras
    .map((extra) => ({
      text: extra.text,
      items: extra.items.filter((item) => !mentionsOutfitItem(guideText, item)),
    }))
    .filter((extra) => extra.items.length > 0);
}

/**
 * 조건 근거 한 줄을 "비가 와서 방수 바람막이를 챙기면 좋아요."처럼 문장으로 만든다.
 * @param extra 조건 문구와 장비들
 */
function formatExtra(extra: ExtraDetail): string {
  const names = extra.items.map((item) => item.label).join('·');
  return `${extra.text} ${withObjectParticle(names)} ${OUTFIT_REASON_MESSAGES.closing}`;
}

/**
 * 복장을 왜 이렇게 추천했는지 근거를 만든다. 추천 결과(outfit)에 실제로 있는 항목만 설명한다.
 * 가이드 문단이 이미 말한 장비는 조건 근거에서 뺀다. (같은 말이 두 번 보이지 않게)
 * @param feelsLike 개인 체감온도
 * @param weather 현재 날씨
 * @param activity 활동
 * @param outfit recommendOutfit이 만든 복장
 * @param guideText AI 가이드 문단 (아직 없으면 빈 문자열)
 */
export function buildOutfitReason(
  feelsLike: number,
  weather: Weather,
  activity: Activity,
  outfit: OutfitItem[],
  guideText = '',
): OutfitReason {
  const extras = collectExtras(outfit, weather);
  // 기본 근거는 조건 근거가 맡는 장비를 다시 부르지 않는다. (가이드 문단 때문에 조건 근거에서 빠져도 마찬가지)
  const explained = new Set(
    extras.slice(0, MAX_OUTFIT_EXTRA_REASONS).flatMap((extra) => extra.items.map((i) => i.label)),
  );
  const baseLabels = outfit
    .filter((item) => BASE_CATEGORIES.includes(item.category) && !explained.has(item.label))
    .map((item) => item.label)
    .slice(0, MAX_OUTFIT_BASE_LABELS);
  const base = formatOutfitBase(feelsLike, baseLabels);
  return {
    base: isWarmupActivity(activity) ? `${base} ${OUTFIT_REASON_MESSAGES.warmup}` : base,
    extras: omitMentioned(extras, guideText).slice(0, MAX_OUTFIT_EXTRA_REASONS).map(formatExtra),
  };
}
