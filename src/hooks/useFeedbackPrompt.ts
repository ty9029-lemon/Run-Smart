import { useEffect, useState } from 'react';
import { findPendingFeedback } from '../lib/feedback';
import { useHistoryStore } from '../store/historyStore';
import type { HistoryEntry } from '../types';

/**
 * 피드백을 물어볼 기록을 돌려준다.
 * 마운트, 탭 복귀(visibilitychange), 히스토리 변경 시점에 다시 확인한다.
 */
export function useFeedbackPrompt(): HistoryEntry | null {
  const entries = useHistoryStore((s) => s.entries);
  const [pending, setPending] = useState<HistoryEntry | null>(() =>
    findPendingFeedback(entries, Date.now()),
  );

  useEffect(() => {
    /** 현재 시각 기준으로 질문 대상을 다시 계산한다. */
    const check = () => setPending(findPendingFeedback(entries, Date.now()));
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };
    check();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [entries]);

  return pending;
}
