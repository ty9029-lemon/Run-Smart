import type { OutfitIconKey } from '../types';

/** 복장 일러스트 이미지 주소 (파일명 = 아이콘 키, 빌드 시 해시가 붙은 주소로 치환된다) */
const OUTFIT_ICON_URLS = import.meta.glob<string>('../assets/outfit/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});

/**
 * 아이콘 키에 해당하는 일러스트 이미지 주소를 돌려준다.
 * @param icon 아이콘 키
 * @returns 이미지 주소 (파일이 없으면 undefined)
 */
export function outfitIconUrl(icon: OutfitIconKey): string | undefined {
  return OUTFIT_ICON_URLS[`../assets/outfit/${icon}.webp`];
}

/** 에셋 폴더에 들어 있는 일러스트 파일 키 목록 (테스트용) */
export function listOutfitIconFileKeys(): string[] {
  return Object.keys(OUTFIT_ICON_URLS).map((path) =>
    path.replace('../assets/outfit/', '').replace('.webp', ''),
  );
}
