import type { OutfitCategory } from '../types';

/** 복장 그룹 표시 순서 */
export const OUTFIT_CATEGORY_ORDER: OutfitCategory[] = ['top', 'outer', 'bottom', 'shoes', 'gear'];

/** 복장 그룹 소제목 */
export const OUTFIT_CATEGORY_LABELS: Record<OutfitCategory, string> = {
  top: '상의',
  outer: '겉옷',
  bottom: '하의',
  shoes: '신발',
  gear: '장비·소품',
};
