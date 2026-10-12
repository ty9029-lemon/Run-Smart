import type { Activity, AiGuide, Decision, Feedback, HistoryEntry, OutfitItem } from '../types';
import { logger } from './logger';
import { ensureUserId, supabase } from './supabase';

const TABLE = 'history_entries';

/** history_entries 테이블 한 행 */
interface HistoryRow {
  id: string;
  user_id: string;
  date: string;
  activity: Activity;
  decision: Decision;
  weather_summary: string;
  guide: AiGuide;
  feels_like: number | null;
  outfit: OutfitItem[] | null;
  feedback: Feedback | null;
  feedback_at: string | null;
}

/** 앱의 기록 한 건을 DB 행으로 바꾼다. */
export function toHistoryRow(entry: HistoryEntry, userId: string): HistoryRow {
  return {
    id: entry.id,
    user_id: userId,
    date: entry.date,
    activity: entry.activity,
    decision: entry.decision,
    weather_summary: entry.weatherSummary,
    guide: entry.guide,
    feels_like: entry.feelsLike ?? null,
    outfit: entry.outfit ?? null,
    feedback: entry.feedback ?? null,
    feedback_at: entry.feedbackAt ?? null,
  };
}

/** DB 행을 앱의 기록 한 건으로 바꾼다. (비어 있는 값은 필드를 생략한다) */
export function fromHistoryRow(row: HistoryRow): HistoryEntry {
  return {
    id: row.id,
    date: new Date(row.date).toISOString(),
    activity: row.activity,
    decision: row.decision,
    weatherSummary: row.weather_summary,
    guide: row.guide,
    ...(row.feels_like !== null && { feelsLike: row.feels_like }),
    ...(row.outfit !== null && { outfit: row.outfit }),
    ...(row.feedback !== null && { feedback: row.feedback }),
    ...(row.feedback_at !== null && { feedbackAt: new Date(row.feedback_at).toISOString() }),
  };
}

/** 내 기록을 모두 불러온다. 서버를 쓸 수 없거나 실패하면 null. */
export async function fetchHistory(): Promise<HistoryEntry[] | null> {
  if (!supabase || !(await ensureUserId())) return null;
  const { data, error } = await supabase.from(TABLE).select('*');
  if (error) {
    logger.warn('기록 조회 실패', error);
    return null;
  }
  return (data as HistoryRow[]).map(fromHistoryRow);
}

/** 기록을 저장한다. 같은 id는 덮어쓴다. 실패해도 예외를 던지지 않는다. */
export async function upsertHistory(entries: HistoryEntry[]): Promise<void> {
  const userId = await ensureUserId();
  if (!supabase || !userId || entries.length === 0) return;
  const rows = entries.map((entry) => toHistoryRow(entry, userId));
  const { error } = await supabase.from(TABLE).upsert(rows, { onConflict: 'user_id,id' });
  if (error) logger.warn('기록 저장 실패', error);
}

/** 기록을 삭제한다. 실패해도 예외를 던지지 않는다. */
export async function deleteHistory(ids: string[]): Promise<void> {
  if (!supabase || ids.length === 0 || !(await ensureUserId())) return;
  const { error } = await supabase.from(TABLE).delete().in('id', ids);
  if (error) logger.warn('기록 삭제 실패', error);
}
