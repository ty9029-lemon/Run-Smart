import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  APP_REVIEW_AFTER_BLOCKER_DELAY_MS,
  APP_REVIEW_DISMISS_COOLDOWN_DAYS,
  APP_REVIEW_MAX_DISMISSALS,
  APP_REVIEW_SESSION_IDLE_MS,
  APP_REVIEW_SHOW_DELAY_MS,
  MS_PER_DAY,
} from '../constants/thresholds';
import {
  APP_REVIEW_LAST_ACTIVE_KEY,
  APP_REVIEW_STATE_KEY,
  INITIAL_REVIEW_STATE,
  isEligibleForAppReview,
  loadReviewState,
  markSessionShown,
  planAppReview,
  resolveSession,
  type ReviewSession,
  type ReviewState,
  type ReviewStorage,
  type ReviewStorages,
} from './appReview';

vi.mock('./logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

/** 메모리에만 저장하는 가짜 저장소 */
function createMemoryStorage(): ReviewStorage {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

const NOW = new Date('2026-10-12T09:00:00').getTime();
const MINUTE = 60 * 1000;

/** 재방문 세션 기본값 */
const REVISIT_SESSION: ReviewSession = { isRevisit: true, enteredAt: NOW, shown: false };

/** 기본 입력(재방문 + 기록 1건)에 일부만 바꿔 만든다. */
function makeInput(
  patch: { entryCount?: number; state?: Partial<ReviewState>; session?: Partial<ReviewSession> } = {},
) {
  return {
    entryCount: patch.entryCount ?? 1,
    state: { ...INITIAL_REVIEW_STATE, ...patch.state },
    session: { ...REVISIT_SESSION, ...patch.session },
    now: NOW,
  };
}

describe('isEligibleForAppReview', () => {
  it('재방문 + 출발 기록 1회 이상이면 노출한다', () => {
    expect(isEligibleForAppReview(makeInput())).toBe(true);
  });

  it('첫 방문(이전 세션 없음)이면 노출하지 않는다', () => {
    expect(isEligibleForAppReview(makeInput({ session: { isRevisit: false } }))).toBe(false);
  });

  it('출발 기록이 없으면 노출하지 않는다', () => {
    expect(isEligibleForAppReview(makeInput({ entryCount: 0 }))).toBe(false);
  });

  it('이미 응답했으면 노출하지 않는다', () => {
    expect(isEligibleForAppReview(makeInput({ state: { submitted: true } }))).toBe(false);
  });

  it('이 세션에서 이미 띄웠으면 노출하지 않는다', () => {
    expect(isEligibleForAppReview(makeInput({ session: { shown: true } }))).toBe(false);
  });

  it('닫은 뒤 쿨다운 중이면 노출하지 않고, 지나면 다시 노출한다', () => {
    const cooldownMs = APP_REVIEW_DISMISS_COOLDOWN_DAYS * MS_PER_DAY;
    const recent = { dismissCount: 1, lastDismissedAt: NOW - cooldownMs + MINUTE };
    const expired = { dismissCount: 1, lastDismissedAt: NOW - cooldownMs };
    expect(isEligibleForAppReview(makeInput({ state: recent }))).toBe(false);
    expect(isEligibleForAppReview(makeInput({ state: expired }))).toBe(true);
  });

  it('최대 횟수만큼 닫았으면 쿨다운이 지나도 노출하지 않는다', () => {
    const state = {
      dismissCount: APP_REVIEW_MAX_DISMISSALS,
      lastDismissedAt: NOW - APP_REVIEW_DISMISS_COOLDOWN_DAYS * MS_PER_DAY * 2,
    };
    expect(isEligibleForAppReview(makeInput({ state }))).toBe(false);
  });

  it('이월된 요청이 있으면 새 세션이 재방문이 아니어도 노출한다', () => {
    const input = makeInput({ session: { isRevisit: false }, state: { reviewPending: true } });
    expect(isEligibleForAppReview(input)).toBe(true);
  });
});

describe('planAppReview', () => {
  it('막힌 것이 없으면 기본 지연 후 노출한다', () => {
    expect(planAppReview(makeInput(), false, false)).toEqual({
      action: 'show',
      delayMs: APP_REVIEW_SHOW_DELAY_MS,
    });
  });

  it('토스트·체감 카드에 막혔다가 풀리면 짧은 지연 후 노출한다', () => {
    expect(planAppReview(makeInput(), false, true)).toEqual({
      action: 'show',
      delayMs: APP_REVIEW_AFTER_BLOCKER_DELAY_MS,
    });
  });

  it('막혀 있으면 노출하지 않고 이월 표시를 남긴다', () => {
    expect(planAppReview(makeInput(), true, false)).toEqual({ action: 'markPending' });
  });

  it('이미 이월 표시가 있으면 막혀 있어도 다시 표시하지 않는다', () => {
    const input = makeInput({ state: { reviewPending: true } });
    expect(planAppReview(input, true, true)).toEqual({ action: 'none' });
  });

  it('조건을 갖추지 못했으면 막혀 있어도 이월 표시를 남기지 않는다', () => {
    expect(planAppReview(makeInput({ entryCount: 0 }), true, false)).toEqual({ action: 'none' });
  });
});

describe('resolveSession', () => {
  let storages: ReviewStorages;

  beforeEach(() => {
    storages = { session: createMemoryStorage(), local: createMemoryStorage() };
  });

  it('처음 여는 앱은 재방문이 아니다', () => {
    expect(resolveSession(NOW, storages).isRevisit).toBe(false);
  });

  it('새 탭에서 다시 열면(같은 날 포함) 재방문이다', () => {
    resolveSession(NOW, storages);
    const newTab = { session: createMemoryStorage(), local: storages.local };
    expect(resolveSession(NOW + 5 * MINUTE, newTab).isRevisit).toBe(true);
  });

  it('같은 세션에서 새로고침해도 처음 내린 판정을 유지한다', () => {
    resolveSession(NOW, storages);
    expect(resolveSession(NOW + 5 * MINUTE, storages).isRevisit).toBe(false);
  });

  it('노출한 기록은 새로고침 후에도 유지된다', () => {
    const first = resolveSession(NOW, storages);
    markSessionShown(first, storages.session);
    expect(resolveSession(NOW + MINUTE, storages).shown).toBe(true);
  });

  it('활동이 멈춘 뒤 비활동 시간이 지나 돌아오면 새 세션(재방문)이다', () => {
    resolveSession(NOW, storages);
    const returned = resolveSession(NOW + APP_REVIEW_SESSION_IDLE_MS, storages);
    expect(returned).toMatchObject({ isRevisit: true, shown: false });
  });

  it('비활동 시간 안에 돌아오면 같은 세션이다', () => {
    resolveSession(NOW, storages);
    const returned = resolveSession(NOW + APP_REVIEW_SESSION_IDLE_MS - MINUTE, storages);
    expect(returned.isRevisit).toBe(false);
  });

  it('자정을 넘겨도 비활동이 아니면 판정이 바뀌지 않는다', () => {
    const beforeMidnight = new Date('2026-10-12T23:59:00').getTime();
    resolveSession(beforeMidnight, storages);
    const afterMidnight = beforeMidnight + 2 * MINUTE;
    expect(resolveSession(afterMidnight, storages).isRevisit).toBe(false);
  });

  it('시각이 거꾸로 가도 기존 판정을 유지한다', () => {
    resolveSession(NOW, storages);
    expect(resolveSession(NOW - MS_PER_DAY, storages).isRevisit).toBe(false);
  });

  it('저장된 값이 깨져 있어도 새 세션으로 처리한다', () => {
    storages.local.setItem(APP_REVIEW_LAST_ACTIVE_KEY, '깨진 값');
    storages.session.setItem('run-smart-review-session', '{깨진 값');
    expect(resolveSession(NOW, storages)).toMatchObject({ isRevisit: false, shown: false });
  });
});

describe('loadReviewState', () => {
  it('저장된 값이 없으면 기본값이다', () => {
    expect(loadReviewState(createMemoryStorage())).toEqual(INITIAL_REVIEW_STATE);
  });

  it('깨진 값이면 기본값이다', () => {
    const storage = createMemoryStorage();
    storage.setItem(APP_REVIEW_STATE_KEY, '{깨진 값');
    expect(loadReviewState(storage)).toEqual(INITIAL_REVIEW_STATE);
  });

  it('저장된 값을 읽는다', () => {
    const storage = createMemoryStorage();
    const saved = { dismissCount: 1, lastDismissedAt: NOW, submitted: false, reviewPending: true };
    storage.setItem(APP_REVIEW_STATE_KEY, JSON.stringify(saved));
    expect(loadReviewState(storage)).toEqual(saved);
  });
});
