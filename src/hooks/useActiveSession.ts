import { useEffect } from 'react';
import { FEEDBACK_EXPIRE_MS } from '../constants/thresholds';
import { useActiveSessionStore, type ActiveSession } from '../store/activeSessionStore';
import { useHistoryStore } from '../store/historyStore';

/**
 * 진행 중인 활동 세션을 돌려준다.
 * 기록이 사라졌거나(취소·삭제) 너무 오래된(종료를 잊은) 세션은 비워서 타이머가 남지 않게 한다.
 */
export function useActiveSession(): ActiveSession | null {
  const session = useActiveSessionStore((s) => s.session);
  const clear = useActiveSessionStore((s) => s.clear);
  const hasEntry = useHistoryStore((s) =>
    session ? s.entries.some((e) => e.id === session.entryId) : false,
  );

  useEffect(() => {
    if (!session) return;
    const isStale = Date.now() - session.startedAt >= FEEDBACK_EXPIRE_MS;
    if (!hasEntry || isStale) clear();
  }, [session, hasEntry, clear]);

  return session && hasEntry ? session : null;
}
