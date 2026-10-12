import { useHistoryStore } from '../store/historyStore';
import { useProfileStore } from '../store/profileStore';
import type { HistoryEntry } from '../types';
import { deleteHistory, fetchHistory, upsertHistory } from './historyRepo';
import { fetchProfile, upsertProfile } from './profileRepo';
import { ensureUserId } from './supabase';

/** 기록 변경 내용 */
export interface HistoryDiff {
  upserted: HistoryEntry[];
  removedIds: string[];
}

/**
 * 이전/현재 기록 목록을 비교해 서버에 반영할 변경분을 구한다.
 * @param prev 이전 기록
 * @param next 현재 기록
 */
export function diffHistory(prev: HistoryEntry[], next: HistoryEntry[]): HistoryDiff {
  const prevById = new Map(prev.map((e) => [e.id, e]));
  const nextIds = new Set(next.map((e) => e.id));
  return {
    upserted: next.filter((e) => prevById.get(e.id) !== e),
    removedIds: prev.filter((e) => !nextIds.has(e.id)).map((e) => e.id),
  };
}

/**
 * 서버 기록과 이 기기의 기록을 합친다. 같은 id는 서버 쪽을 우선한다.
 * @param local 이 기기에 있던 기록
 * @param remote 서버 기록
 * @returns 합친 기록(최신순)과 서버에 없어 올려야 할 기록
 */
export function mergeHistory(
  local: HistoryEntry[],
  remote: HistoryEntry[],
): { merged: HistoryEntry[]; localOnly: HistoryEntry[] } {
  const remoteIds = new Set(remote.map((e) => e.id));
  const localOnly = local.filter((e) => !remoteIds.has(e.id));
  const merged = [...remote, ...localOnly].sort((a, b) => b.date.localeCompare(a.date));
  return { merged, localOnly };
}

/** 서버 기록을 불러와 이 기기 기록과 합치고, 서버에 없던 기록은 올린다. */
async function hydrateHistory(): Promise<void> {
  const remote = await fetchHistory();
  if (!remote) return;
  const { merged, localOnly } = mergeHistory(useHistoryStore.getState().entries, remote);
  useHistoryStore.setState({ entries: merged });
  await upsertHistory(localOnly);
}

/** 서버 프로필이 있으면 따르고, 없으면 이 기기의 프로필을 올린다. */
async function hydrateProfile(): Promise<void> {
  const remote = await fetchProfile();
  const local = useProfileStore.getState();
  if (remote) {
    useProfileStore.setState({ profile: remote.profile, hasOnboarded: remote.hasOnboarded });
  } else if (local.hasOnboarded) {
    await upsertProfile({ profile: local.profile, hasOnboarded: local.hasOnboarded });
  }
}

/** 이후 스토어 변경을 서버로 흘려보낸다. */
function startWriteThrough(): void {
  useHistoryStore.subscribe((state, prev) => {
    const { upserted, removedIds } = diffHistory(prev.entries, state.entries);
    void upsertHistory(upserted);
    void deleteHistory(removedIds);
  });
  useProfileStore.subscribe((state, prev) => {
    if (state.profile === prev.profile && state.hasOnboarded === prev.hasOnboarded) return;
    void upsertProfile({ profile: state.profile, hasOnboarded: state.hasOnboarded });
  });
}

/**
 * 앱 시작 시 한 번 호출한다. 익명 로그인 → 서버 데이터 반영 → 이후 변경 자동 저장.
 * Supabase를 쓸 수 없으면 아무것도 하지 않고 localStorage로만 동작한다.
 */
export async function initCloudSync(): Promise<void> {
  if (!(await ensureUserId())) return;
  await Promise.all([hydrateHistory(), hydrateProfile()]);
  startWriteThrough();
}
