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
