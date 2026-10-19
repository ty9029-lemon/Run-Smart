import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Input } from '@/components/ui/input';
import {
  ACTUAL_OUTFIT_MAX_LENGTH,
  FEEDBACK_LABELS,
  FEEDBACK_MESSAGES,
  FEEDBACK_ORDER,
} from '../constants/feedback';
import { parseDistanceKm } from '../lib/distance';
import type { Feedback, FeedbackDetail } from '../types';
import DistanceStepper from './DistanceStepper';

const SECTION_TITLE = 'text-base font-bold';

/** 입력값에서 저장할 선택 입력만 골라낸다. (거리는 올바른 숫자일 때만, 복장은 비어 있지 않을 때만) */
export function buildFeedbackDetail(distanceText: string, outfitText: string): FeedbackDetail {
  const distanceKm = parseDistanceKm(distanceText);
  const actualOutfit = outfitText.trim();
  return {
    ...(distanceKm !== null && { distanceKm }),
    ...(actualOutfit && { actualOutfit }),
  };
}

/** 체감 선택지 칩. 하나만 고르므로 선택 상태(라임 외곽선)만 보여준다. */
function FeedbackOptions({
  selected,
  onSelect,
}: {
  selected: Feedback | null;
  onSelect: (feedback: Feedback) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="체감 선택">
      {FEEDBACK_ORDER.map((value) => (
        <Chip key={value} selected={selected === value} onClick={() => onSelect(value)}>
          {FEEDBACK_LABELS[value]}
        </Chip>
      ))}
    </div>
  );
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
        placeholder="나이키 반팔, 언더아머 반바지, 호카 러닝화"
      />
    </section>
  );
}

/** 저장 버튼과 '다음에 할게요' */
function FeedbackActions({
  canSave,
  onSave,
  onLater,
}: {
  canSave: boolean;
  onSave: () => void;
  onLater: () => void;
}) {
  return (
    <div className="space-y-1">
      <Button type="button" size="lg" disabled={!canSave} onClick={onSave} className="w-full">
        {FEEDBACK_MESSAGES.save}
      </Button>
      <Button
        type="button"
        variant="link"
        onClick={onLater}
        className="w-full text-sm font-bold text-muted-foreground"
      >
        {FEEDBACK_MESSAGES.later}
      </Button>
    </div>
  );
}

interface FeedbackFormProps {
  /** 저장 버튼을 눌렀을 때 체감과 선택 입력(거리·복장)을 알린다. */
  onSave: (feedback: Feedback, detail: FeedbackDetail) => void;
  /** '다음에 할게요'를 눌렀을 때 */
  onLater: () => void;
}

/** 체감·거리·실제 복장을 입력받는 폼. 체감만 골라도 저장할 수 있다. 종료 직후 시트와 상단 카드가 함께 쓴다. */
export default function FeedbackForm({ onSave, onLater }: FeedbackFormProps) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [distanceText, setDistanceText] = useState('');
  const [outfitText, setOutfitText] = useState('');
  const isDistanceInvalid = distanceText.trim() !== '' && parseDistanceKm(distanceText) === null;

  return (
    <div className="space-y-7">
      <FeedbackOptions selected={feedback} onSelect={setFeedback} />
      <section className="space-y-3">
        <h3 className={SECTION_TITLE}>몇 키로 뛰었나요? (선택)</h3>
        <DistanceStepper value={distanceText} invalid={isDistanceInvalid} onChange={setDistanceText} />
      </section>
      <OutfitSection value={outfitText} onChange={setOutfitText} />
      <FeedbackActions
        canSave={feedback !== null && !isDistanceInvalid}
        onSave={() => feedback && onSave(feedback, buildFeedbackDetail(distanceText, outfitText))}
        onLater={onLater}
      />
    </div>
  );
}
