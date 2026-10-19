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
  /** 다시 출발할 수 있어도 오늘 이미 출발했다면 그 기록을 알리는 문구 (없으면 표시하지 않음) */
  previousNotice?: string;
  onDecide: () => void;
  /** 종료 확인 후 호출. 타이머 버튼을 누른 시각(ms)을 종료 시각으로 넘긴다 */
  onEnd: (endedAtMs: number) => void;
  onCancel: () => void;
}

/** 출발 전 기본 CTA */
function StartButton({ onDecide }: Pick<DecisionButtonsProps, 'onDecide'>) {
  return (
    <Button type="button" variant="default" size="lg" onClick={onDecide} className="w-full">
      이대로 출발하기
    </Button>
  );
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
  // 타이머 버튼을 누른 순간의 시각과 경과 시간. 확인 팝업이 떠 있는 동안 표시를 고정한다
  const [paused, setPaused] = useState<{ at: number; elapsedMs: number } | null>(null);
  const liveElapsedMs = useStopwatch(startedAt);
  const elapsedText = formatElapsed(paused ? paused.elapsedMs : liveElapsedMs);

  /** 누른 순간을 종료 후보 시각으로 잡고 확인 팝업을 연다. */
  const handleOpenConfirm = () => {
    const at = Date.now();
    setPaused({ at, elapsedMs: startedAt === null ? 0 : at - startedAt });
  };

  /** 종료를 취소하고 활동을 계속한다. 팝업을 열어 둔 시간도 활동 시간에 포함된다. */
  const handleContinue = () => {
    setPaused(null);
    trackEvent(ANALYTICS_EVENTS.activityEndDismissed, { activity });
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        type="button"
        variant="default"
        size="lg"
        onClick={handleOpenConfirm}
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
        open={paused !== null}
        activityLabel={activityLabel}
        elapsedText={elapsedText}
        onContinue={handleContinue}
        onConfirm={() => paused && onEnd(paused.at)}
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
  previousNotice,
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
      <div className="space-y-3">
        <p className="text-center text-base font-medium text-pure-white" role="status">
          {formatEndedNotice(activityLabel)}
        </p>
        <StartButton onDecide={onDecide} />
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
  if (previousNotice) {
    return (
      <div className="space-y-2">
        <p className="text-center text-sm text-steel-border" role="status">
          {previousNotice}
        </p>
        <StartButton onDecide={onDecide} />
      </div>
    );
  }
  return <StartButton onDecide={onDecide} />;
}
