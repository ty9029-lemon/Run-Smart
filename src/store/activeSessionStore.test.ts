import { beforeEach, describe, expect, it } from 'vitest';
import { useActiveSessionStore } from './activeSessionStore';

const SESSION = { entryId: 'a', activity: 'running' as const, startedAt: 1000 };

describe('activeSessionStore', () => {
  beforeEach(() => {
    useActiveSessionStore.setState({ session: null });
  });

  it('시작하면 세션을 저장한다', () => {
    useActiveSessionStore.getState().start(SESSION);
    expect(useActiveSessionStore.getState().session).toEqual(SESSION);
  });

  it('비우면 세션이 사라진다', () => {
    useActiveSessionStore.getState().start(SESSION);
    useActiveSessionStore.getState().clear();
    expect(useActiveSessionStore.getState().session).toBeNull();
  });
});
