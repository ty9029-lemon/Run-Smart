import { MS_PER_DAY } from '../constants/thresholds';

/**
 * ISO 시각을 시간 표기로 바꾼다. (예: 오후 3:07)
 * @param iso ISO 형식 시각 문자열
 */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * 시각 앞에 붙일 날짜 말머리를 돌려준다. (자정을 기준으로 날짜를 비교한다)
 * 오늘이면 빈 문자열, 어제면 "어제", 그보다 전이면 월/일(예: 10월 15일)이다.
 * @param iso ISO 형식 시각 문자열
 * @param now 기준이 되는 현재 시각 (기본: 지금)
 */
export function formatDayPrefix(iso: string, now: Date = new Date()): string {
  const target = new Date(iso);
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const daysAgo = Math.round((startOfDay(now).getTime() - startOfDay(target).getTime()) / MS_PER_DAY);
  if (daysAgo === 0) return '';
  if (daysAgo === 1) return '어제';
  return target.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}
