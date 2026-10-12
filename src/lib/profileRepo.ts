import type { Profile } from '../types';
import { logger } from './logger';
import { ensureUserId, supabase } from './supabase';

const TABLE = 'profiles';

/** 서버에 저장된 프로필 */
export interface RemoteProfile {
  profile: Profile;
  hasOnboarded: boolean;
}

/** profiles 테이블 한 행 */
interface ProfileRow {
  user_id: string;
  data: Profile;
  has_onboarded: boolean;
}

/** 내 프로필을 불러온다. 없거나 서버를 쓸 수 없으면 null. */
export async function fetchProfile(): Promise<RemoteProfile | null> {
  const userId = await ensureUserId();
  if (!supabase || !userId) return null;
  const { data, error } = await supabase.from(TABLE).select('*').eq('user_id', userId).maybeSingle();
  if (error) {
    logger.warn('프로필 조회 실패', error);
    return null;
  }
  const row = data as ProfileRow | null;
  return row ? { profile: row.data, hasOnboarded: row.has_onboarded } : null;
}

/** 프로필을 저장한다. 실패해도 예외를 던지지 않는다. */
export async function upsertProfile(remote: RemoteProfile): Promise<void> {
  const userId = await ensureUserId();
  if (!supabase || !userId) return;
  const row = {
    user_id: userId,
    data: remote.profile,
    has_onboarded: remote.hasOnboarded,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from(TABLE).upsert(row);
  if (error) logger.warn('프로필 저장 실패', error);
}
