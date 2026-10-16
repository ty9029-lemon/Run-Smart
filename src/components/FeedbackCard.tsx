import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { getActivityMeta } from '../constants/activities';
import {
  ACTUAL_OUTFIT_MAX_LENGTH,
  FEEDBACK_LABELS,
  FEEDBACK_ORDER,
} from '../constants/feedback';
import { useFeedbackPrompt } from '../hooks/useFeedbackPrompt';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import { parseDistanceKm } from '../lib/distance';
import { formatTime } from '../lib/formatTime';
import { useHistoryStore } from '../store/historyStore';
import { useProfileStore } from '../store/profileStore';
import type { Feedback, FeedbackDetail, HistoryEntry } from '../types';
import DistanceStepper from './DistanceStepper';

/** 바텀 시트 위치·모양 (화면 아래에 붙이고 위쪽 모서리만 둥글게) */
const SHEET_CLASS =
  'top-auto bottom-0 max-w-md translate-y-0 gap-7 rounded-b-none sm:max-w-md';

const SECTION_TITLE = 'text-base font-bold';

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
        <Chip
          key={value}
          selected={selected === value}
          onClick={() => onSelect(value)}
        >
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

interface FeedbackFormProps {
  entry: HistoryEntry;
  /** 저장 버튼을 눌렀을 때 입력값을 알린다. */
  onSave: (feedback: Feedback, detail: FeedbackDetail) => void;
  onDismiss: () => void;
}

/** 입력값에서 저장할 선택 입력만 골라낸다. (거리는 올바른 숫자일 때만, 복장은 비어 있지 않을 때만) */
function buildDetail(distanceText: string, outfitText: string): FeedbackDetail {
  const distanceKm = parseDistanceKm(distanceText);
  const actualOutfit = outfitText.trim();
  return {
    ...(distanceKm !== null && { distanceKm }),
    ...(actualOutfit && { actualOutfit }),
  };
}

/** 시트 제목과 체감 선택지 */
function FeedbackHeader({
  entry,
  selected,
  onSelect,
}: {
  entry: HistoryEntry;
  selected: Feedback | null;
  onSelect: (feedback: Feedback) => void;
}) {
  return (
    <div className="space-y-4">
      <DialogTitle className="text-lg">
        {formatTime(entry.date)} {getActivityMeta(entry.activity).label}, 어땠어요?
      </DialogTitle>
      <DialogDescription className="sr-only">
        체감과 거리, 실제 착용한 복장을 기록하면 다음 추천에 반영돼요.
      </DialogDescription>
      <FeedbackOptions selected={selected} onSelect={onSelect} />
    </div>
  );
}

/** 저장 버튼과 '다음에 할게요' */
function FeedbackActions({
  canSave,
  onSave,
  onDismiss,
}: {
  canSave: boolean;
  onSave: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="space-y-1">
      <Button type="button" size="lg" disabled={!canSave} onClick={onSave} className="w-full">
        저장
      </Button>
      <Button
        type="button"
        variant="link"
        onClick={onDismiss}
        className="w-full text-sm font-bold text-muted-foreground"
      >
        다음에 할게요
      </Button>
    </div>
  );
}

/** 체감·거리·실제 복장을 입력받는 시트 내용 */
function FeedbackForm({ entry, onSave, onDismiss }: FeedbackFormProps) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [distanceText, setDistanceText] = useState('');
  const [outfitText, setOutfitText] = useState('');
  const isDistanceInvalid = distanceText.trim() !== '' && parseDistanceKm(distanceText) === null;

  return (
    <>
      <FeedbackHeader entry={entry} selected={feedback} onSelect={setFeedback} />
      <section className="space-y-3">
        <h3 className={SECTION_TITLE}>몇 키로 뛰었나요? (선택)</h3>
        <DistanceStepper value={distanceText} invalid={isDistanceInvalid} onChange={setDistanceText} />
      </section>
      <OutfitSection value={outfitText} onChange={setOutfitText} />
      <FeedbackActions
        canSave={feedback !== null && !isDistanceInvalid}
        onSave={() => feedback && onSave(feedback, buildDetail(distanceText, outfitText))}
        onDismiss={onDismiss}
      />
    </>
  );
}

interface FeedbackCardProps {
  /** '다음에 할게요'로 닫았을 때, 닫은 기록의 id와 함께 알린다. */
  onDismiss?: (id: string) => void;
}

/** 다녀온 뒤 체감·거리·복장을 묻는 바텀 시트. 체감은 다음 추천(복장·시간대)에 반영된다. */
export default function FeedbackCard({ onDismiss }: FeedbackCardProps) {
  const pending = useFeedbackPrompt();
  const setFeedback = useHistoryStore((s) => s.setFeedback);
  const applyFeedback = useProfileStore((s) => s.applyFeedback);
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  // 방금 답한 기록 id. 다음 미응답 기록이 있으면 그 기록의 질문이 이어서 나온다.
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  if (submittedId && (!pending || pending.id === submittedId)) {
    return (
      <p className="rounded-panel border border-card-border-ink bg-card-charcoal p-6 text-sm" role="status">
        알려주셔서 고마워요. 다음 추천부터 반영할게요.
      </p>
    );
  }
  if (!pending || pending.id === dismissedId) return null;

  /** 피드백과 입력값을 기록하고 체감 보정값에 누적한다. */
  const handleSave = (feedback: Feedback, detail: FeedbackDetail) => {
    setFeedback(pending.id, feedback, detail);
    applyFeedback(feedback);
    trackEvent(ANALYTICS_EVENTS.feedbackSubmitted, {
      feedback,
      activity: pending.activity,
      feelsLike: pending.feelsLike ?? 0,
      hasDistance: detail.distanceKm !== undefined,
      hasActualOutfit: detail.actualOutfit !== undefined,
    });
    setSubmittedId(pending.id);
  };

  /** 시트를 닫고 이 기록은 더 묻지 않는다. */
  const handleDismiss = () => {
    setDismissedId(pending.id);
    onDismiss?.(pending.id);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className={SHEET_CLASS} showCloseButton={false}>
        <FeedbackForm key={pending.id} entry={pending} onSave={handleSave} onDismiss={handleDismiss} />
      </DialogContent>
    </Dialog>
  );
}
