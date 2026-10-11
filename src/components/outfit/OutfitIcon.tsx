import { outfitIconUrl } from '../../lib/outfitIconUrls';
import type { OutfitIconKey } from '../../types';

interface OutfitIconProps {
  icon: OutfitIconKey;
  className?: string;
}

/**
 * 복장 일러스트를 그린다. 검정 배경 이미지라 screen 블렌드로 어두운 카드와 섞는다.
 * 이름은 옆의 label 텍스트가 대신하므로 대체 텍스트는 비운다.
 * @param icon 일러스트 키
 * @param className 크기 등 추가 클래스
 */
export default function OutfitIcon({ icon, className }: OutfitIconProps) {
  const src = outfitIconUrl(icon);
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      className={`mix-blend-screen ${className ?? ''}`}
    />
  );
}
