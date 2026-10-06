/**
 * 서버리스 함수용 로거. Vercel 로그에서 확인할 수 있도록 stderr에 남긴다.
 * (console 사용을 이 파일 한 곳에 모은다)
 * @param message 로그 메시지
 * @param error 원인 에러 (메시지만 남기고 요청 본문·키는 기록하지 않는다)
 */
export function logServerError(message: string, error?: unknown): void {
  const detail = error instanceof Error ? error.message : '';
  // eslint-disable-next-line no-console
  console.error(`[RunSmart][guide] ${message}`, detail);
}
