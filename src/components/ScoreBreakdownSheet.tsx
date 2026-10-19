import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SCORE_REASON_MESSAGES } from '../constants/scoreReasons';
import { describeRatio, formatFactorValue, type ScoreReason } from '../lib/scoreReasons';
import type { Weather } from '../types';

/** 화면 아래에서 올라오는 시트 모양 (FeedbackSheet와 같다) */
const SHEET_CLASS = [
  'top-auto bottom-0 translate-y-0 max-w-full sm:max-w-md rounded-b-none',
  'max-h-[85vh] overflow-y-auto',
  'pb-[calc(1.5rem+env(safe-area-inset-bottom))]',
  'data-open:zoom-in-100 data-open:slide-in-from-bottom',
  'data-closed:zoom-out-100 data-closed:slide-out-to-bottom',
].join(' ');

/** 비율(0~1)을 백분율로 바꿀 때 곱하는 값 */
const PERCENT = 100;

interface ScoreBreakdownSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  score: number;
  reasons: ScoreReason[];
  weather: Weather;
  feelsLike: number;
}

/** 항목 한 줄: 이름·현재 값·해석, 받은 점수 막대, 깎인 점수 */
function ReasonRow({ reason, value }: { reason: ScoreReason; value: string }) {
  const { label, points, max, penalty, ratio, sensitive } = reason;
  const earnedPercent = (1 - ratio) * PERCENT;
  return (
    <li className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium">
          {label} <span className="font-normal text-subtle-text">{value}</span>
        </span>
        <span className="shrink-0 text-sm tabular-nums">
          {points}/{max}점
          {penalty > 0 && <span className="ml-1.5 text-level-bad">−{penalty}</span>}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-card-border-ink" aria-hidden="true">
        <div className="h-full rounded-full bg-primary" style={{ width: `${earnedPercent}%` }} />
      </div>
      <p className="text-sm text-subtle-text">
        {describeRatio(ratio)}
        {sensitive && ` · ${SCORE_REASON_MESSAGES.sensitiveNote}`}
      </p>
    </li>
  );
}

/** 항목별로 몇 점을 받고 몇 점이 깎였는지 보여주는 바텀 시트 */
export default function ScoreBreakdownSheet({
  open,
  onOpenChange,
  score,
  reasons,
  weather,
  feelsLike,
}: ScoreBreakdownSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className={SHEET_CLASS}>
        <DialogHeader>
          <DialogTitle className="text-lg">
            {SCORE_REASON_MESSAGES.sheetTitle} ({score}점)
          </DialogTitle>
          <DialogDescription>{SCORE_REASON_MESSAGES.sheetDescription}</DialogDescription>
        </DialogHeader>
        <ul className="space-y-4">
          {reasons.map((reason) => (
            <ReasonRow
              key={reason.key}
              reason={reason}
              value={formatFactorValue(reason.key, weather, feelsLike)}
            />
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
