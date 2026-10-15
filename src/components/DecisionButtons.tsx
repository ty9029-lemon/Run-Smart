import { Button } from '@/components/ui/button';
import {
  formatDepartedNotice,
  formatEndButtonLabel,
  formatEndedNotice,
  MESSAGES,
} from '../constants/messages';
import { useStopwatch } from '../hooks/useStopwatch';
import type { DepartureStatus } from '../lib/departureStatus';
import { formatElapsed } from '../lib/formatElapsed';

interface DecisionButtonsProps {
  /** 출발 전, 진행 중, 종료 직후 등 CTA 자리의 상태 */
  status: DepartureStatus;
  /** 안내 문구에 들어갈 활동명 */
  activityLabel: string;
  /** 진행 중인 활동의 시작 시각(ms). 진행 중이 아니면 null */
  startedAt: number | null;
  onDecide: () => void;
  onEnd: () => void;
  onCancel: () => void;
}

/** [출발 취소] 링크 버튼 */
function CancelLink({ onCancel }: { onCancel: () => void }) {
  return (
    <Button type="button" variant="link" size="sm" onClick={onCancel} className="text-steel-border">
      {MESSAGES.departureCancel}
    </Button>
  );
}

/** 활동 시간이 분:초로 흘러가는 종료 버튼. 누르면 활동을 마치고 기록한다. */
function RunningTimer({
  activityLabel,
  startedAt,
  onEnd,
  onCancel,
}: Pick<DecisionButtonsProps, 'activityLabel' | 'startedAt' | 'onEnd' | 'onCancel'>) {
  const elapsedText = formatElapsed(useStopwatch(startedAt));
  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        type="button"
        variant="default"
        size="lg"
        onClick={onEnd}
        aria-label={formatEndButtonLabel(activityLabel, elapsedText)}
        className="w-full text-xl font-bold tabular-nums"
      >
        {elapsedText}
      </Button>
      <CancelLink onCancel={onCancel} />
    </div>
  );
}

/**
 * [이대로 출발하기] 단일 CTA.
 * 출발하면 같은 자리가 타이머 버튼으로 바뀌고, 누르면 활동이 종료된다.
 */
export default function DecisionButtons({
  status,
  activityLabel,
  startedAt,
  onDecide,
  onEnd,
  onCancel,
}: DecisionButtonsProps) {
  if (status === 'running') {
    return (
      <RunningTimer
        activityLabel={activityLabel}
        startedAt={startedAt}
        onEnd={onEnd}
        onCancel={onCancel}
      />
    );
  }
  if (status === 'ended') {
    return (
      <div className="py-2 text-center">
        <p className="text-base font-medium text-pure-white" role="status">
          {formatEndedNotice(activityLabel)}
        </p>
      </div>
    );
  }
  if (status === 'departed') {
    return (
      <div className="flex flex-col items-center gap-1 py-2">
        <p className="text-base font-medium text-pure-white" role="status">
          {formatDepartedNotice(activityLabel)}
        </p>
        <CancelLink onCancel={onCancel} />
      </div>
    );
  }
  return (
    <Button type="button" variant="default" size="lg" onClick={onDecide} className="w-full">
      이대로 출발하기
    </Button>
  );
}
