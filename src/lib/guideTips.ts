import type { AiGuide, OutfitItem } from '../types';

/** 같은 물건을 다르게 부르는 말 (복장 이름 → 팁에서 쓰는 말) */
const OUTFIT_ALIASES: Record<string, string[]> = {
  선크림: ['자외선 차단제'],
};

/** 한 복장 이름에 두 가지 물건이 함께 적힌 경우의 구분자 (예: 반바지/러닝, 긴바지 또는 레깅스, 전조등·후미등) */
const LABEL_SEPARATOR = /\/| 또는 |·/;

/** 복장 이름에서 핵심 단어를 뽑는다. 슬래시나 "또는"으로 나뉜 각 이름의 마지막 단어다. (예: "긴바지 또는 레깅스" → 긴바지, 레깅스) */
function outfitKeywords(items: OutfitItem[]): string[] {
  return items
    .flatMap((item) => item.label.split(LABEL_SEPARATOR))
    .map((name) => name.trim().split(/\s+/).pop() ?? '')
    .filter((word) => word.length >= 2)
    .flatMap((word) => [word, ...(OUTFIT_ALIASES[word] ?? [])]);
}

/**
 * 가이드 문단(홈에 한 단락으로 이어 붙여 보이는 총평 + 상세 이유)을 만든다.
 * @param guide AI 가이드
 */
export function formatGuideParagraph(guide: AiGuide): string {
  return `${guide.guideMessage} ${guide.detailedReason}`;
}

/**
 * 문단이 이 복장 항목을 이미 말하고 있는지 확인한다. (예: "선글라스를 챙겨"는 선글라스 또는 고글을 말한 것으로 본다)
 * @param text 가이드 문단
 * @param item 복장 항목
 */
export function mentionsOutfitItem(text: string, item: OutfitItem): boolean {
  return outfitKeywords([item]).some((word) => text.includes(word));
}

/**
 * 복장 카드에 이미 보이는 항목을 말하는 팁을 뺀다. (예: 카드에 긴팔이 있으면 "긴팔 입기"는 뺀다)
 * AI가 복장 항목을 팁에 다시 쓰지 않도록 안내하지만, 어겼을 때도 화면이 겹치지 않게 한다.
 * @param tips AI 가이드의 활동 팁
 * @param outfit 화면에 보여주는 복장
 */
export function filterTipsNotInOutfit(tips: string[], outfit: OutfitItem[]): string[] {
  const keywords = outfitKeywords(outfit);
  return tips.filter((tip) => !keywords.some((word) => tip.includes(word)));
}
