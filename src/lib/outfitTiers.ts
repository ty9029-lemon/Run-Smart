import type { Activity, OutfitCategory, OutfitIconKey, OutfitItem } from '../types';

/** 복장 구간별 체감온도 상한(°C, 이하) */
const COLD_MAX = 4;
const COOL_MAX = 13;
const CHILLY_MAX = 18;
const MILD_MAX = 22;
const WARM_MAX = 27;

/** 운동 중 체온 상승을 반영해 더하는 체감온도 보정(°C). 러닝·자전거 구간 비교에 쓴다 */
export const EXERCISE_WARMUP_OFFSET = 6;
/** 러닝·자전거의 쌀쌀 상한(보정 전 체감온도, °C). 체감 13°C에서도 긴 하의를 추천하려고 따로 둔다 */
const EXERCISE_COOL_FELT_MAX = 13;
/** 선선 상한(보정 전 체감온도, °C). 러닝은 온화 구간을 두지 않고 선선에 합쳤다 */
const RUNNING_CHILLY_FELT_MAX = 16;
const CYCLING_CHILLY_FELT_MAX = 15;
/** 러닝·자전거 구간 상한 (보정이 더해진 체감온도 기준) */
const EXERCISE_COOL_MAX = EXERCISE_COOL_FELT_MAX + EXERCISE_WARMUP_OFFSET;
const RUNNING_CHILLY_MAX = RUNNING_CHILLY_FELT_MAX + EXERCISE_WARMUP_OFFSET;
const CYCLING_CHILLY_MAX = CYCLING_CHILLY_FELT_MAX + EXERCISE_WARMUP_OFFSET;

/** 체감온도 구간별 복장 (상한 오름차순, 마지막은 상한 없음) */
export interface OutfitTier {
  max: number;
  items: OutfitItem[];
}

/**
 * 복장 항목을 만든다.
 * @param category 분류
 * @param icon 일러스트 키
 * @param label 이름
 */
export function outfitItem(category: OutfitCategory, icon: OutfitIconKey, label: string): OutfitItem {
  return { category, icon, label };
}

/** 산책: 일상복 기준 */
const WALKING_TIERS: OutfitTier[] = [
  {
    max: COLD_MAX,
    items: [outfitItem('outer', 'jacket', '패딩/두꺼운 겉옷'), outfitItem('bottom', 'pants', '긴바지')],
  },
  {
    max: COOL_MAX,
    items: [
      outfitItem('top', 'longSleeve', '긴팔 상의'),
      outfitItem('outer', 'jacket', '바람막이/재킷'),
      outfitItem('bottom', 'pants', '긴바지'),
    ],
  },
  {
    max: CHILLY_MAX,
    items: [
      outfitItem('top', 'longSleeve', '긴팔 상의'),
      outfitItem('outer', 'jacket', '가디건/얇은 겉옷'),
      outfitItem('bottom', 'pants', '긴바지'),
    ],
  },
  {
    max: MILD_MAX,
    items: [outfitItem('top', 'longSleeve', '얇은 긴팔 상의'), outfitItem('bottom', 'pants', '긴바지')],
  },
  {
    max: WARM_MAX,
    items: [outfitItem('top', 'tshirt', '반팔 상의'), outfitItem('bottom', 'shorts', '반바지')],
  },
  {
    max: Infinity,
    items: [outfitItem('top', 'tank', '민소매/얇은 반팔'), outfitItem('bottom', 'shorts', '반바지')],
  },
];

/** 러닝: 운동 중 체온 상승분이 보정된 체감온도 기준 (온화 구간 없이 선선이 체감 16°C까지) */
const RUNNING_TIERS: OutfitTier[] = [
  {
    max: COLD_MAX,
    items: [
      outfitItem('top', 'longSleeve', '기모 기능성 긴팔'),
      outfitItem('outer', 'jacket', '경량 바람막이'),
      outfitItem('bottom', 'pants', '기모 바지/레깅스'),
      outfitItem('gear', 'gloves', '러닝 장갑·넥워머'),
    ],
  },
  {
    max: EXERCISE_COOL_MAX,
    items: [
      outfitItem('top', 'longSleeve', '기능성 긴팔 티셔츠'),
      outfitItem('outer', 'jacket', '경량 바람막이'),
      outfitItem('bottom', 'pants', '긴바지/러닝 레깅스'),
    ],
  },
  {
    max: RUNNING_CHILLY_MAX,
    items: [outfitItem('top', 'longSleeve', '기능성 긴팔 티셔츠'), outfitItem('bottom', 'pants', '긴바지/러닝 레깅스')],
  },
  {
    max: WARM_MAX,
    items: [outfitItem('top', 'tshirt', '기능성 반팔 티셔츠'), outfitItem('bottom', 'shorts', '러닝 쇼츠')],
  },
  {
    max: Infinity,
    items: [
      outfitItem('top', 'tank', '러닝 민소매'),
      outfitItem('bottom', 'shorts', '러닝 쇼츠'),
      outfitItem('gear', 'cap', '러닝 모자'),
    ],
  },
];

/** 자전거: 운동 중 체온 상승분이 보정된 체감온도 기준 (바람을 맞으므로 방풍이 핵심) */
const CYCLING_TIERS: OutfitTier[] = [
  {
    max: COLD_MAX,
    items: [
      outfitItem('top', 'cyclingJersey', '기모 긴팔 져지'),
      outfitItem('outer', 'jacket', '윈드 재킷'),
      outfitItem('bottom', 'tights', '기모 빕타이츠'),
      outfitItem('gear', 'gloves', '방풍 장갑'),
      outfitItem('gear', 'socks', '토캡·발목 커버'),
    ],
  },
  {
    max: EXERCISE_COOL_MAX,
    items: [
      outfitItem('top', 'cyclingJersey', '긴팔 사이클 져지'),
      outfitItem('outer', 'vest', '윈드 베스트'),
      outfitItem('bottom', 'tights', '빕타이츠'),
      outfitItem('gear', 'gloves', '방풍 장갑'),
    ],
  },
  {
    max: CYCLING_CHILLY_MAX,
    items: [
      outfitItem('top', 'cyclingJersey', '긴팔 사이클 져지'),
      outfitItem('bottom', 'shorts', '빕숏'),
      outfitItem('gear', 'legWarmer', '레그워머'),
    ],
  },
  {
    max: MILD_MAX,
    items: [
      outfitItem('top', 'cyclingJersey', '반팔 사이클 져지'),
      outfitItem('bottom', 'shorts', '빕숏'),
      outfitItem('gear', 'armWarmer', '암워머'),
    ],
  },
  {
    max: WARM_MAX,
    items: [
      outfitItem('top', 'cyclingJersey', '반팔 사이클 져지'),
      outfitItem('bottom', 'shorts', '빕숏'),
      outfitItem('gear', 'armWarmer', '쿨 팔토시'),
    ],
  },
  {
    max: Infinity,
    items: [
      outfitItem('top', 'tank', '민소매 사이클 져지'),
      outfitItem('bottom', 'shorts', '빕숏'),
      outfitItem('gear', 'armWarmer', '쿨 팔토시'),
    ],
  },
];

/** 등산: 겹쳐 입는(레이어링) 구성. 체온 상승 보정 없이 체감온도 그대로 본다 */
const HIKING_TIERS: OutfitTier[] = [
  {
    max: COLD_MAX,
    items: [
      outfitItem('top', 'longSleeve', '기능성 긴팔 티셔츠'),
      outfitItem('outer', 'fleece', '플리스'),
      outfitItem('outer', 'jacket', '경량 패딩'),
      outfitItem('outer', 'jacket', '하드쉘'),
      outfitItem('bottom', 'pants', '기모 등산 바지'),
      outfitItem('gear', 'gloves', '등산 장갑·비니'),
    ],
  },
  {
    max: COOL_MAX,
    items: [
      outfitItem('top', 'longSleeve', '기능성 긴팔 티셔츠'),
      outfitItem('outer', 'fleece', '플리스'),
      outfitItem('outer', 'jacket', '소프트쉘'),
      outfitItem('bottom', 'pants', '등산 바지'),
    ],
  },
  {
    max: CHILLY_MAX,
    items: [
      outfitItem('top', 'longSleeve', '기능성 긴팔 티셔츠'),
      outfitItem('outer', 'fleece', '얇은 플리스'),
      outfitItem('bottom', 'pants', '등산 바지'),
    ],
  },
  {
    max: MILD_MAX,
    items: [outfitItem('top', 'longSleeve', '기능성 얇은 긴팔'), outfitItem('bottom', 'pants', '등산 바지')],
  },
  {
    max: WARM_MAX,
    items: [outfitItem('top', 'tshirt', '기능성 반팔 티셔츠'), outfitItem('bottom', 'pants', '등산 바지')],
  },
  {
    max: Infinity,
    items: [outfitItem('top', 'tank', '쿨링 기능성 티셔츠'), outfitItem('bottom', 'shorts', '등산 반바지')],
  },
];

/** 활동별 체감온도 구간표 */
export const TIERS_BY_ACTIVITY: Record<Activity, OutfitTier[]> = {
  walking: WALKING_TIERS,
  running: RUNNING_TIERS,
  cycling: CYCLING_TIERS,
  hiking: HIKING_TIERS,
};

/** 활동별로 날씨와 상관없이 항상 추천하는 신발·필수 장비 */
export const BASE_ITEMS_BY_ACTIVITY: Record<Activity, OutfitItem[]> = {
  walking: [outfitItem('shoes', 'sneakers', '운동화')],
  running: [outfitItem('shoes', 'sneakers', '러닝화')],
  cycling: [outfitItem('shoes', 'sneakers', '사이클 슈즈/운동화'), outfitItem('gear', 'helmet', '헬멧')],
  hiking: [outfitItem('shoes', 'hikingBoots', '등산화'), outfitItem('shoes', 'socks', '등산 양말')],
};
