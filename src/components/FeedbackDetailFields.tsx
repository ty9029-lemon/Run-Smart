import { Input } from '@/components/ui/input';
import { ACTUAL_OUTFIT_MAX_LENGTH } from '../constants/feedback';
import DistanceStepper from './DistanceStepper';

/** 입력 섹션 제목 */
export const SECTION_TITLE = 'text-subheading-sm font-bold';

interface FeedbackDetailFieldsProps {
  /** 거리 입력창에 적힌 글자 */
  distanceText: string;
  /** 실제 복장 입력창에 적힌 글자 */
  outfitText: string;
  /** 거리 글자가 올바른 거리가 아닐 때 true */
  isDistanceInvalid: boolean;
  onDistanceChange: (text: string) => void;
  onOutfitChange: (text: string) => void;
}

/** 실제 착용한 복장을 적는 입력 */
function OutfitSection({ value, onChange }: { value: string; onChange: (text: string) => void }) {
  return (
    <section className="space-y-2">
      <h3 className={SECTION_TITLE}>실제 착용한 복장 (선택)</h3>
      <p className="text-sm text-muted-foreground">
        러닝할 때 실제 입었던 복장을 기록해두면, 다음 러닝 시 어떻게 입었는지 참고할 수 있어요.
      </p>
      <Input
        aria-label="실제 착용한 복장"
        value={value}
        maxLength={ACTUAL_OUTFIT_MAX_LENGTH}
        onChange={(e) => onChange(e.target.value)}
        placeholder="예: 나이키 반팔, 언더아머 반바지, 호카 러닝화"
      />
    </section>
  );
}

/**
 * 거리와 실제 복장을 입력받는 두 섹션. 종료 직후 폼과 기록 수정 시트가 함께 쓴다.
 * 섹션 사이 간격은 부모가 정한다.
 */
export default function FeedbackDetailFields({
  distanceText,
  outfitText,
  isDistanceInvalid,
  onDistanceChange,
  onOutfitChange,
}: FeedbackDetailFieldsProps) {
  return (
    <>
      <section className="space-y-3">
        <h3 className={SECTION_TITLE}>몇 키로 뛰었나요? (선택)</h3>
        <DistanceStepper
          value={distanceText}
          invalid={isDistanceInvalid}
          onChange={onDistanceChange}
        />
      </section>
      <OutfitSection value={outfitText} onChange={onOutfitChange} />
    </>
  );
}
