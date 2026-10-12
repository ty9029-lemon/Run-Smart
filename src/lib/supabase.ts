import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** 환경변수가 없으면 null (이 경우 앱은 localStorage만으로 동작한다) */
export const supabase: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

/** 진행 중이거나 끝난 사용자 확인 요청 (중복 로그인 방지) */
let userIdPromise: Promise<string | null> | null = null;

/** 저장된 세션이 있으면 쓰고, 없으면 익명 로그인한다. */
async function resolveUserId(client: SupabaseClient): Promise<string | null> {
  const { data: current } = await client.auth.getSession();
  if (current.session) return current.session.user.id;

  const { data, error } = await client.auth.signInAnonymously();
  if (error || !data.user) {
    logger.warn('익명 로그인 실패', error);
    return null;
  }
  return data.user.id;
}

/**
 * 현재 사용자 id를 돌려준다. 세션이 없으면 익명으로 로그인한다.
 * Supabase가 설정되지 않았거나 로그인에 실패하면 null.
 */
export function ensureUserId(): Promise<string | null> {
  if (!supabase) return Promise.resolve(null);
  if (!userIdPromise) {
    userIdPromise = resolveUserId(supabase).then((id) => {
      if (!id) userIdPromise = null; // 실패하면 다음 호출에서 다시 시도
      return id;
    });
  }
  return userIdPromise;
}
