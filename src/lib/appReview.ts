import {
  APP_REVIEW_AFTER_BLOCKER_DELAY_MS,
  APP_REVIEW_DISMISS_COOLDOWN_DAYS,
  APP_REVIEW_MAX_DISMISSALS,
  APP_REVIEW_MIN_ENTRIES,
  APP_REVIEW_SESSION_IDLE_MS,
  APP_REVIEW_SHOW_DELAY_MS,
  MS_PER_DAY,
} from '../constants/thresholds';
import { logger } from './logger';

/** 만족도 팝업 응답·닫기 상태를 저장하는 localStorage 키 */
export const APP_REVIEW_STATE_KEY = 'run-smart-app-review';
/** 마지막 활동 시각(ms)을 저장하는 localStorage 키. 값이 있으면 이전 세션이 있었다는 뜻이다 */
export const APP_REVIEW_LAST_ACTIVE_KEY = 'run-smart-last-active-at';
/** 현재 세션 판정을 저장하는 sessionStorage 키 */
export const APP_REVIEW_SESSION_KEY = 'run-smart-review-session';

/** 이 모듈이 쓰는 저장소의 부분 (테스트에서 대체 가능) */
export type ReviewStorage = Pick<Storage, 'getItem' | 'setItem'>;

/** 세션용·영구용 저장소 묶음 */
export interface ReviewStorages {
  session: ReviewStorage;
  local: ReviewStorage;
}

/** 팝업 응답·닫기 상태 */
export interface ReviewState {
  /** 닫은 횟수 */
  dismissCount: number;
  /** 마지막으로 닫은 시각(ms) */
  lastDismissedAt: number | null;
  /** 응답을 제출했는지 */
  submitted: boolean;
  /** 노출 조건은 갖췄지만 다른 안내에 막혀 못 띄웠는지 (다음 세션으로 이월) */
  reviewPending: boolean;
}

/** 한 세션의 판정 결과 */
export interface ReviewSession {
  /** 이전 세션이 있었던 재방문인지 */
  isRevisit: boolean;
  /** 세션 시작 시각(ms) */
  enteredAt: number;
  /** 이 세션에서 팝업을 이미 띄웠는지 */
  shown: boolean;
}

/** 노출 여부 판단에 필요한 입력 */
export interface ReviewEligibilityInput {
  entryCount: number;
  state: ReviewState;
  session: ReviewSession;
  now: number;
}

/** 저장된 상태가 없을 때의 기본값 */
export const INITIAL_REVIEW_STATE: ReviewState = {
  dismissCount: 0,
  lastDismissedAt: null,
  submitted: false,
  reviewPending: false,
};

/** 브라우저 저장소를 쓸 수 없을 때 대신 쓰는 메모리 저장소를 만든다. */
function createMemoryStorage(): ReviewStorage {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

const memorySessionStorage = createMemoryStorage();
const memoryLocalStorage = createMemoryStorage();

/** sessionStorage를 돌려준다. 사용할 수 없으면 메모리 저장소 */
function getSessionStorage(): ReviewStorage {
  try {
    return typeof sessionStorage === 'undefined' ? memorySessionStorage : sessionStorage;
  } catch {
    return memorySessionStorage;
  }
}

/** localStorage를 돌려준다. 사용할 수 없으면 메모리 저장소 */
function getLocalStorage(): ReviewStorage {
  try {
    return typeof localStorage === 'undefined' ? memoryLocalStorage : localStorage;
  } catch {
    return memoryLocalStorage;
  }
}

/** 기본 저장소 묶음(브라우저)을 돌려준다. */
export function getDefaultReviewStorages(): ReviewStorages {
  return { session: getSessionStorage(), local: getLocalStorage() };
}

/** 저장소의 JSON 값을 읽는다. 없거나 깨졌으면 null */
function readJson(storage: ReviewStorage, key: string): unknown {
  try {
    return JSON.parse(storage.getItem(key) ?? 'null');
  } catch {
    return null;
  }
}

/** 저장소에 값을 쓴다. 실패해도 예외를 던지지 않는다. */
function writeItem(storage: ReviewStorage, key: string, value: string): void {
  try {
    storage.setItem(key, value);
  } catch (error) {
    logger.warn('만족도 팝업 상태를 저장하지 못했습니다.', error);
  }
}

/** 마지막 활동 시각(ms)을 읽는다. 없거나 깨졌으면 null */
function readLastActiveAt(storage: ReviewStorage): number | null {
  try {
    const raw = storage.getItem(APP_REVIEW_LAST_ACTIVE_KEY);
    const value = raw === null ? Number.NaN : Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

/** 저장된 값이 세션 형태인지 확인한다. */
function isReviewSession(value: unknown): value is ReviewSession {
  const session = value as Partial<ReviewSession> | null;
  return (
    typeof session === 'object' &&
    session !== null &&
    typeof session.isRevisit === 'boolean' &&
    typeof session.enteredAt === 'number' &&
    typeof session.shown === 'boolean'
  );
}

/**
 * 마지막 활동 시각을 지금으로 갱신한다.
 * @param now 현재 시각(ms)
 * @param storage 저장할 곳 (기본: localStorage)
 */
export function touchLastActive(now: number, storage: ReviewStorage = getLocalStorage()): void {
  writeItem(storage, APP_REVIEW_LAST_ACTIVE_KEY, String(now));
}

/**
 * 현재 세션이 재방문인지 판정한다.
 * 같은 세션(새로고침 포함)에서는 처음 내린 판정을 그대로 유지하고,
 * 저장된 세션이 없거나 오래 비활동했다 돌아온 경우에만 새 세션으로 본다.
 * 날짜가 아니라 저장된 시각만 쓰므로 자정을 넘겨도 판정이 흔들리지 않는다.
 * @param now 현재 시각(ms)
 * @param storages 저장소 묶음 (기본: 브라우저)
 */
export function resolveSession(
  now: number,
  storages: ReviewStorages = getDefaultReviewStorages(),
): ReviewSession {
  const stored = readJson(storages.session, APP_REVIEW_SESSION_KEY);
  const lastActiveAt = readLastActiveAt(storages.local);
  // 시각이 거꾸로 간 경우(now < lastActiveAt)는 비활동으로 보지 않는다
  const isIdle =
    lastActiveAt !== null &&
    now >= lastActiveAt &&
    now - lastActiveAt >= APP_REVIEW_SESSION_IDLE_MS;
  const session: ReviewSession =
    isReviewSession(stored) && !isIdle
      ? stored
      : { isRevisit: lastActiveAt !== null, enteredAt: now, shown: false };
  writeItem(storages.session, APP_REVIEW_SESSION_KEY, JSON.stringify(session));
  touchLastActive(now, storages.local);
  return session;
}

/**
 * 이 세션에서 팝업을 띄웠다고 기록한다.
 * @param session 현재 세션
 * @param storage 저장할 곳 (기본: sessionStorage)
 */
export function markSessionShown(
  session: ReviewSession,
  storage: ReviewStorage = getSessionStorage(),
): ReviewSession {
  const next = { ...session, shown: true };
  writeItem(storage, APP_REVIEW_SESSION_KEY, JSON.stringify(next));
  return next;
}

/** 저장된 팝업 상태를 읽는다. 없거나 깨졌으면 기본값 */
export function loadReviewState(storage: ReviewStorage = getLocalStorage()): ReviewState {
  const stored = readJson(storage, APP_REVIEW_STATE_KEY) as Partial<ReviewState> | null;
  if (typeof stored !== 'object' || stored === null) return INITIAL_REVIEW_STATE;
  return {
    dismissCount: typeof stored.dismissCount === 'number' ? stored.dismissCount : 0,
    lastDismissedAt: typeof stored.lastDismissedAt === 'number' ? stored.lastDismissedAt : null,
    submitted: stored.submitted === true,
    reviewPending: stored.reviewPending === true,
  };
}

/** 팝업 상태를 저장한다. */
export function saveReviewState(
  state: ReviewState,
  storage: ReviewStorage = getLocalStorage(),
): void {
  writeItem(storage, APP_REVIEW_STATE_KEY, JSON.stringify(state));
}

/** 닫은 뒤 쿨다운이 아직 끝나지 않았는지 */
function isCoolingDown(state: ReviewState, now: number): boolean {
  if (state.lastDismissedAt === null) return false;
  return now - state.lastDismissedAt < APP_REVIEW_DISMISS_COOLDOWN_DAYS * MS_PER_DAY;
}

/**
 * 다른 안내에 막히지 않았다면 팝업을 띄울 조건을 갖췄는지 판단한다.
 * 재방문(또는 이월된 요청) + 출발 기록 1회 이상 + 응답·쿨다운·닫기 횟수·세션당 1회 제한을 모두 본다.
 */
export function isEligibleForAppReview(input: ReviewEligibilityInput): boolean {
  const { entryCount, state, session, now } = input;
  if (state.submitted || session.shown) return false;
  if (state.dismissCount >= APP_REVIEW_MAX_DISMISSALS || isCoolingDown(state, now)) return false;
  if (entryCount < APP_REVIEW_MIN_ENTRIES) return false;
  return session.isRevisit || state.reviewPending;
}

/** 다음에 할 일: 아무것도 안 함, 이월 표시, 지연 후 노출 */
export type ReviewPlan =
  | { action: 'none' }
  | { action: 'markPending' }
  | { action: 'show'; delayMs: number };

/**
 * 지금 상황에서 팝업을 어떻게 할지 정한다.
 * 다른 안내(토스트·체감 카드)가 떠 있으면 이월 표시만 해 두고, 그 안내가 끝난 뒤에는 짧게 기다렸다 띄운다.
 * @param input 노출 판단 입력
 * @param isBlocked 다른 안내가 화면에 떠 있는지
 * @param wasBlocked 이번 화면에서 이미 다른 안내에 막힌 적이 있는지
 */
export function planAppReview(
  input: ReviewEligibilityInput,
  isBlocked: boolean,
  wasBlocked: boolean,
): ReviewPlan {
  if (!isEligibleForAppReview(input)) return { action: 'none' };
  if (isBlocked) return input.state.reviewPending ? { action: 'none' } : { action: 'markPending' };
  const delayMs = wasBlocked ? APP_REVIEW_AFTER_BLOCKER_DELAY_MS : APP_REVIEW_SHOW_DELAY_MS;
  return { action: 'show', delayMs };
}
