import { describe, expect, it } from 'vitest';
import {
  elapsedSeconds,
  formatDurationText,
  formatElapsed,
  isTooShortToRecord,
} from './formatElapsed';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

describe('formatElapsed', () => {
  it('0이면 00:00', () => {
    expect(formatElapsed(0)).toBe('00:00');
  });

  it('1시간 미만은 mm:ss로 표시한다', () => {
    expect(formatElapsed(7 * SECOND)).toBe('00:07');
    expect(formatElapsed(59 * MINUTE + 59 * SECOND)).toBe('59:59');
  });

  it('1초 미만은 버린다', () => {
    expect(formatElapsed(7 * SECOND + 999)).toBe('00:07');
  });

  it('1시간 이상은 h:mm:ss로 표시한다', () => {
    expect(formatElapsed(HOUR)).toBe('1:00:00');
    expect(formatElapsed(HOUR + SECOND)).toBe('1:00:01');
    expect(formatElapsed(12 * HOUR + 3 * MINUTE + 9 * SECOND)).toBe('12:03:09');
  });

  it('음수는 00:00으로 본다', () => {
    expect(formatElapsed(-5 * SECOND)).toBe('00:00');
  });
});

describe('elapsedSeconds', () => {
  it('화면 표시와 같이 1초 미만은 버린다', () => {
    expect(elapsedSeconds(1000, 1000 + 20 * SECOND + 900)).toBe(20);
  });

  it('종료가 시작보다 앞서면 0이다', () => {
    expect(elapsedSeconds(5000, 1000)).toBe(0);
  });
});

describe('formatDurationText', () => {
  it('1분 미만은 초로 표시한다', () => {
    expect(formatDurationText(0)).toBe('0초');
    expect(formatDurationText(42)).toBe('42초');
  });

  it('1시간 미만은 분과 초로 표시한다', () => {
    expect(formatDurationText(21 * 60)).toBe('21분');
    expect(formatDurationText(21 * 60 + 5)).toBe('21분 5초');
    expect(formatDurationText(59 * 60 + 59)).toBe('59분 59초');
  });

  it('1시간 이상은 시간과 분으로 표시한다', () => {
    expect(formatDurationText(3600)).toBe('1시간');
    expect(formatDurationText(3600 + 5 * 60 + 30)).toBe('1시간 5분');
  });

  it('음수는 0초로 본다', () => {
    expect(formatDurationText(-3)).toBe('0초');
  });
});

describe('isTooShortToRecord', () => {
  it('1분 미만은 기록하기엔 짧다', () => {
    expect(isTooShortToRecord(0)).toBe(true);
    expect(isTooShortToRecord(59)).toBe(true);
  });

  it('1분부터는 기록한다', () => {
    expect(isTooShortToRecord(60)).toBe(false);
    expect(isTooShortToRecord(1800)).toBe(false);
  });
});
