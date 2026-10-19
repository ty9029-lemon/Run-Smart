import { describe, expect, it } from 'vitest';
import { MS_PER_SECOND, REDEPARTURE_DELAY_MS } from '../constants/thresholds';
import { buildDummyGuide } from '../data/dummyGuide';
import { DUMMY_CURRENT_WEATHER } from '../data/dummyWeather';
import type { HistoryEntry } from '../types';
import { getDepartureStatus } from './departureStatus';
import { NEUTRAL_SENSITIVITY } from './feelsLike';

const NOW = new Date('2026-10-15T12:00:00Z').getTime();
const SECONDS_PER_HOUR = 3600;

/** 출발 시각을 지정한 기록 */
function entryStartedAt(startedMs: number, patch: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    id: `e-${startedMs}`,
    date: new Date(startedMs).toISOString(),
    activity: 'running',
    decision: 'go',
    weatherSummary: '',
    guide: buildDummyGuide('running', DUMMY_CURRENT_WEATHER, NEUTRAL_SENSITIVITY, []),
    ...patch,
  };
}

describe('getDepartureStatus', () => {
  it('기록이 없으면 출발 전이다', () => {
    expect(getDepartureStatus(null, false, NOW)).toBe('ready');
  });

  it('진행 중이면 기록과 상관없이 running이다', () => {
    expect(getDepartureStatus(entryStartedAt(NOW - MS_PER_SECOND), true, NOW)).toBe('running');
  });

  it('활동을 마친 직후에는 ended다', () => {
    const entry = entryStartedAt(NOW - 600 * MS_PER_SECOND, { durationSec: 590 });
    expect(getDepartureStatus(entry, false, NOW)).toBe('ended');
  });

  it('오래 활동한 뒤에도 대기 시간은 마친 시각부터 센다', () => {
    const entry = entryStartedAt(NOW - 2 * SECONDS_PER_HOUR * MS_PER_SECOND, {
      durationSec: SECONDS_PER_HOUR + 2700,
    });
    expect(getDepartureStatus(entry, false, NOW)).toBe('ended');
  });

  it('마친 뒤 대기 시간이 지나면 다시 출발할 수 있다', () => {
    const entry = entryStartedAt(NOW - REDEPARTURE_DELAY_MS - 600 * MS_PER_SECOND, {
      durationSec: 600,
    });
    expect(getDepartureStatus(entry, false, NOW)).toBe('ready');
  });

  it('종료 기록이 없는 이전 기록은 기존처럼 출발 안내를 보여준다', () => {
    expect(getDepartureStatus(entryStartedAt(NOW - MS_PER_SECOND), false, NOW)).toBe('departed');
    expect(getDepartureStatus(entryStartedAt(NOW - REDEPARTURE_DELAY_MS), false, NOW)).toBe('ready');
  });
});
