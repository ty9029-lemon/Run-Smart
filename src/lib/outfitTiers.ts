import type { Activity, OutfitCategory, OutfitItem } from '../types';

/** 복장 구간별 체감온도 상한(°C, 이하) */
const COLD_MAX = 4;
const COOL_MAX = 11;
const CHILLY_MAX = 16;
const MILD_MAX = 22;
const WARM_MAX = 27;

/** 체감온도 구간별 복장 (상한 오름차순, 마지막은 상한 없음) */
export interface OutfitTier {
  max: number;
  items: OutfitItem[];
}

/**
 * 복장 항목을 만든다.
 * @param category 분류
 * @param emoji 이모지
 * @param label 이름
 */
export function outfitItem(category: OutfitCategory, emoji: string, label: string): OutfitItem {
  return { category, emoji, label };
}

/** 산책: 일상복 기준 */
const WALKING_TIERS: OutfitTier[] = [
  {
    max: COLD_MAX,
    items: [outfitItem('outer', '🧥', '패딩/두꺼운 겉옷'), outfitItem('bottom', '👖', '긴바지')],
  },
  {
    max: COOL_MAX,
    items: [
      outfitItem('top', '👕', '긴팔 상의'),
      outfitItem('outer', '🧥', '바람막이/재킷'),
      outfitItem('bottom', '👖', '긴바지'),
    ],
  },
  {
    max: CHILLY_MAX,
    items: [
      outfitItem('top', '👕', '긴팔 상의'),
      outfitItem('outer', '🧥', '가디건/얇은 겉옷'),
      outfitItem('bottom', '👖', '긴바지'),
    ],
  },
  {
    max: MILD_MAX,
    items: [outfitItem('top', '👕', '얇은 긴팔 상의'), outfitItem('bottom', '👖', '긴바지')],
  },
  {
    max: WARM_MAX,
    items: [outfitItem('top', '👕', '반팔 상의'), outfitItem('bottom', '🩳', '반바지')],
  },
  {
    max: Infinity,
    items: [outfitItem('top', '🎽', '민소매/얇은 반팔'), outfitItem('bottom', '🩳', '반바지')],
  },
];

/** 러닝: 운동 중 체온 상승분이 보정된 체감온도 기준 */
const RUNNING_TIERS: OutfitTier[] = [
  {
    max: COLD_MAX,
    items: [
      outfitItem('top', '👕', '기모 기능성 긴팔'),
      outfitItem('outer', '🧥', '경량 바람막이'),
      outfitItem('bottom', '🩲', '기모 러닝 타이츠'),
      outfitItem('gear', '🧤', '러닝 장갑·넥워머'),
    ],
  },
  {
    max: COOL_MAX,
    items: [
      outfitItem('top', '👕', '기능성 긴팔 티셔츠'),
      outfitItem('outer', '🧥', '경량 바람막이'),
      outfitItem('bottom', '🩲', '러닝 타이츠'),
    ],
  },
  {
    max: CHILLY_MAX,
    items: [outfitItem('top', '👕', '기능성 긴팔 티셔츠'), outfitItem('bottom', '🩲', '러닝 타이츠')],
  },
  {
    max: MILD_MAX,
    items: [
      outfitItem('top', '👕', '기능성 얇은 긴팔'),
      outfitItem('bottom', '🩲', '러닝 7부 타이츠'),
    ],
  },
  {
    max: WARM_MAX,
    items: [outfitItem('top', '👕', '기능성 반팔 티셔츠'), outfitItem('bottom', '🩳', '러닝 쇼츠')],
  },
  {
    max: Infinity,
    items: [
      outfitItem('top', '🎽', '러닝 민소매'),
      outfitItem('bottom', '🩳', '러닝 쇼츠'),
      outfitItem('gear', '🧢', '러닝 캡'),
    ],
  },
];

/** 자전거: 운동 중 체온 상승분이 보정된 체감온도 기준 (바람을 맞으므로 방풍이 핵심) */
const CYCLING_TIERS: OutfitTier[] = [
  {
    max: COLD_MAX,
    items: [
      outfitItem('top', '🚴', '기모 긴팔 져지'),
      outfitItem('outer', '🧥', '윈드 재킷'),
      outfitItem('bottom', '🩲', '기모 빕타이츠'),
      outfitItem('gear', '🧤', '방풍 장갑'),
      outfitItem('gear', '🧦', '토캡·발목 커버'),
    ],
  },
  {
    max: COOL_MAX,
    items: [
      outfitItem('top', '🚴', '긴팔 사이클 져지'),
      outfitItem('outer', '🦺', '윈드 베스트'),
      outfitItem('bottom', '🩲', '빕타이츠'),
      outfitItem('gear', '🧤', '방풍 장갑'),
    ],
  },
  {
    max: CHILLY_MAX,
    items: [
      outfitItem('top', '🚴', '긴팔 사이클 져지'),
      outfitItem('bottom', '🩳', '빕숏'),
      outfitItem('gear', '🦵', '레그워머'),
    ],
  },
  {
    max: MILD_MAX,
    items: [
      outfitItem('top', '🚴', '반팔 사이클 져지'),
      outfitItem('bottom', '🩳', '빕숏'),
      outfitItem('gear', '💪', '암워머'),
    ],
  },
  {
    max: WARM_MAX,
    items: [outfitItem('top', '🚴', '반팔 사이클 져지'), outfitItem('bottom', '🩳', '빕숏')],
  },
  {
    max: Infinity,
    items: [outfitItem('top', '🎽', '민소매 사이클 져지'), outfitItem('bottom', '🩳', '빕숏')],
  },
];

/** 등산: 겹쳐 입는(레이어링) 구성. 체온 상승 보정 없이 체감온도 그대로 본다 */
const HIKING_TIERS: OutfitTier[] = [
  {
    max: COLD_MAX,
    items: [
      outfitItem('top', '👕', '기능성 긴팔 티셔츠'),
      outfitItem('outer', '🧶', '플리스'),
      outfitItem('outer', '🧥', '경량 패딩'),
      outfitItem('outer', '🧥', '하드쉘'),
      outfitItem('bottom', '👖', '기모 등산 바지'),
      outfitItem('gear', '🧤', '등산 장갑·비니'),
    ],
  },
  {
    max: COOL_MAX,
    items: [
      outfitItem('top', '👕', '기능성 긴팔 티셔츠'),
      outfitItem('outer', '🧶', '플리스'),
      outfitItem('outer', '🧥', '소프트쉘'),
      outfitItem('bottom', '👖', '등산 바지'),
    ],
  },
  {
    max: CHILLY_MAX,
    items: [
      outfitItem('top', '👕', '기능성 긴팔 티셔츠'),
      outfitItem('outer', '🧶', '얇은 플리스'),
      outfitItem('bottom', '👖', '등산 바지'),
    ],
  },
  {
    max: MILD_MAX,
    items: [outfitItem('top', '👕', '기능성 얇은 긴팔'), outfitItem('bottom', '👖', '등산 바지')],
  },
  {
    max: WARM_MAX,
    items: [outfitItem('top', '👕', '기능성 반팔 티셔츠'), outfitItem('bottom', '👖', '등산 바지')],
  },
  {
    max: Infinity,
    items: [outfitItem('top', '🎽', '쿨링 기능성 티셔츠'), outfitItem('bottom', '🩳', '등산 반바지')],
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
  walking: [outfitItem('shoes', '👟', '운동화')],
  running: [outfitItem('shoes', '👟', '러닝화')],
  cycling: [outfitItem('shoes', '👟', '사이클 슈즈/운동화'), outfitItem('gear', '⛑️', '헬멧')],
  hiking: [outfitItem('shoes', '🥾', '등산화'), outfitItem('shoes', '🧦', '등산 양말')],
};
