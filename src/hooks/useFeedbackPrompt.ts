import { useEffect, useState } from 'react';
import { findPendingFeedback } from '../lib/feedback';
import { useActiveSessionStore } from '../store/activeSessionStore';
import { useHistoryStore } from '../store/historyStore';
import type { HistoryEntry } from '../types';

/**
 * 피드백을 물어볼 기록을 돌려준다.
 * 마운트, 탭 복귀(visibilitychange), 히스토리·진행 중 활동 변경 시점에 다시 확인한다.
 */
export function useFeedbackPrompt(): HistoryEntry | null {
  const entries = useHistoryStore((s) => s.entries);
  const activeEntryId = useActiveSessionStore((s) => s.session?.entryId ?? null);
  const [pending, setPending] = useState<HistoryEntry | null>(() =>
    findPendingFeedback(entries, Date.now(), activeEntryId),
  );

  useEffect(() => {
    /** 현재 시각 기준으로 질문 대상을 다시 계산한다. */
    const check = () => setPending(findPendingFeedback(entries, Date.now(), activeEntryId));
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };
    check();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [entries, activeEntryId]);

  return pending;
}
