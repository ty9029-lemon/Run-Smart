import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  formatDepartedNotice,
  formatEndedNotice,
  formatTimerButtonLabel,
  MESSAGES,
} from '../constants/messages';
import { useStopwatch } from '../hooks/useStopwatch';
import { ANALYTICS_EVENTS, trackEvent } from '../lib/analytics';
import type { DepartureStatus } from '../lib/departureStatus';
import { formatElapsed } from '../lib/formatElapsed';
import type { Activity } from '../types';
import EndActivityDialog from './EndActivityDialog';

interface DecisionButtonsProps {
  /** 출발 전, 진행 중, 종료 직후 등 CTA 자리의 상태 */
  status: DepartureStatus;
  /** 안내 문구에 들어갈 활동명 */
  activityLabel: string;
  /** 현재 활동 (분석 이벤트용) */
  activity: Activity;
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

/** 활동 시간이 분:초로 흘러가는 타이머 버튼. 누르면 종료 확인 팝업이 열리고, 확인하면 활동을 마친다. */
function RunningTimer({
  activityLabel,
  activity,
  startedAt,
  onEnd,
  onCancel,
}: Pick<DecisionButtonsProps, 'activityLabel' | 'activity' | 'startedAt' | 'onEnd' | 'onCancel'>) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const elapsedText = formatElapsed(useStopwatch(startedAt));

  /** 종료를 취소하고 활동을 계속한다. */
  const handleContinue = () => {
    setConfirmOpen(false);
    trackEvent(ANALYTICS_EVENTS.activityEndDismissed, { activity });
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        type="button"
        variant="default"
        size="lg"
        onClick={() => setConfirmOpen(true)}
        aria-label={formatTimerButtonLabel(activityLabel, elapsedText)}
        className="w-full"
      >
        {/* 장식용 진행 표시 점: 토스트가 사라진 뒤에도 기록 중임을 알린다 */}
        <span
          aria-hidden="true"
          className="size-2 rounded-full bg-carbon-black motion-safe:animate-pulse"
        />
        <span className="text-sm font-medium">{MESSAGES.elapsedLabel}</span>
        <span className="text-xl font-bold tabular-nums">{elapsedText}</span>
      </Button>
      <CancelLink onCancel={onCancel} />
      <EndActivityDialog
        open={confirmOpen}
        activityLabel={activityLabel}
        elapsedText={elapsedText}
        onContinue={handleContinue}
        onConfirm={onEnd}
      />
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
  activity,
  startedAt,
  onDecide,
  onEnd,
  onCancel,
}: DecisionButtonsProps) {
  if (status === 'running') {
    return (
      <RunningTimer
        activityLabel={activityLabel}
        activity={activity}
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
