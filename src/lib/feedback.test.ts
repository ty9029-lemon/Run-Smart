import { describe, expect, it } from 'vitest';
import {
  FEEDBACK_ASK_DELAY_MS,
  FEEDBACK_EXPIRE_MS,
  FEEDBACK_OFFSET_LIMIT,
  FEEDBACK_STEP,
} from '../constants/thresholds';
import { buildDummyGuide } from '../data/dummyGuide';
import { DUMMY_CURRENT_WEATHER } from '../data/dummyWeather';
import type { HistoryEntry } from '../types';
import { applyFeedbackToOffset, findPendingFeedback } from './feedback';
import { NEUTRAL_SENSITIVITY } from './feelsLike';

const NOW = new Date('2026-10-08T12:00:00Z').getTime();

/** 지정한 경과 시간 전에 기록된 '가기' 항목 */
function entryAgo(ms: number, patch: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    id: `e-${ms}`,
    date: new Date(NOW - ms).toISOString(),
    activity: 'running',
    decision: 'go',
    weatherSummary: '',
    guide: buildDummyGuide('running', DUMMY_CURRENT_WEATHER, NEUTRAL_SENSITIVITY, []),
    ...patch,
  };
}

describe('findPendingFeedback', () => {
  it('일정 시간이 지나기 전에는 묻지 않는다', () => {
    expect(findPendingFeedback([entryAgo(FEEDBACK_ASK_DELAY_MS - 1)], NOW)).toBeNull();
  });

  it('일정 시간이 지나면 묻는다', () => {
    const entry = entryAgo(FEEDBACK_ASK_DELAY_MS);
    expect(findPendingFeedback([entry], NOW)).toBe(entry);
  });

  it('너무 오래된 기록은 묻지 않는다', () => {
    expect(findPendingFeedback([entryAgo(FEEDBACK_EXPIRE_MS)], NOW)).toBeNull();
  });

  it('안 가기와 이미 답한 기록은 묻지 않는다', () => {
    const skip = entryAgo(FEEDBACK_ASK_DELAY_MS, { decision: 'skip' });
    const answered = entryAgo(FEEDBACK_ASK_DELAY_MS + 1, { feedback: 'good' });
    expect(findPendingFeedback([skip, answered], NOW)).toBeNull();
  });

  it('여러 개면 가장 최근 기록을 고른다', () => {
    const older = entryAgo(FEEDBACK_ASK_DELAY_MS * 3);
    const newer = entryAgo(FEEDBACK_ASK_DELAY_MS * 2);
    expect(findPendingFeedback([older, newer], NOW)).toBe(newer);
  });
});

describe('applyFeedbackToOffset', () => {
  it('추웠으면 체감온도를 낮추고 더웠으면 높인다', () => {
    expect(applyFeedbackToOffset(0, 'cold')).toBe(-FEEDBACK_STEP);
    expect(applyFeedbackToOffset(0, 'hot')).toBe(FEEDBACK_STEP);
  });

  it('적당했으면 그대로 둔다', () => {
    expect(applyFeedbackToOffset(1, 'good')).toBe(1);
  });

  it('한도를 넘지 않는다', () => {
    expect(applyFeedbackToOffset(-FEEDBACK_OFFSET_LIMIT, 'cold')).toBe(-FEEDBACK_OFFSET_LIMIT);
    expect(applyFeedbackToOffset(FEEDBACK_OFFSET_LIMIT, 'hot')).toBe(FEEDBACK_OFFSET_LIMIT);
  });
});
