import { logger } from './logger';
import { ensureUserId, supabase } from './supabase';

const TABLE = 'app_reviews';

/** 제출할 앱 만족도 응답 */
export interface AppReviewInput {
  /** 별점 (1~5) */
  rating: number;
  /** 남긴 메시지. 없으면 빈 문자열 */
  message: string;
  /** 응답 시점의 출발 기록 수 */
  entryCount: number;
}

/**
 * 앱 만족도 응답을 저장한다. 실패해도 예외를 던지지 않는다.
 * @returns 저장에 성공하면 true (서버를 쓸 수 없거나 실패하면 false)
 */
export async function insertAppReview(input: AppReviewInput): Promise<boolean> {
  const userId = await ensureUserId();
  if (!supabase || !userId) return false;
  const { error } = await supabase.from(TABLE).insert({
    user_id: userId,
    rating: input.rating,
    message: input.message.trim() === '' ? null : input.message.trim(),
    entry_count: input.entryCount,
  });
  if (error) {
    logger.warn('만족도 저장 실패', error);
    return false;
  }
  return true;
}
