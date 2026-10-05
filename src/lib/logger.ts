/** 로그 레벨 */
type LogLevel = 'info' | 'warn' | 'error';

/**
 * 간단한 로거. 개발 모드에서만 출력한다.
 * (console.log 대신 이 유틸을 사용한다)
 */
function write(level: LogLevel, message: string, meta?: unknown): void {
  if (!import.meta.env.DEV) return;
  const line = `[RunSmart][${level}] ${message}`;
  // eslint-disable-next-line no-console
  console[level](line, meta ?? '');
}

export const logger = {
  info: (message: string, meta?: unknown) => write('info', message, meta),
  warn: (message: string, meta?: unknown) => write('warn', message, meta),
  error: (message: string, meta?: unknown) => write('error', message, meta),
};
