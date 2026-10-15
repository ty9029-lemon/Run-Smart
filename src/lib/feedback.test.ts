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
import { applyFeedbackToOffset, findPendingFeedback, isFeedbackAskable } from './feedback';
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

  it('활동을 마친 기록은 대기 없이 바로 묻는다', () => {
    const ended = entryAgo(1000, { durationSec: 600 });
    expect(findPendingFeedback([ended], NOW)).toBe(ended);
  });

  it('진행 중인 활동의 기록은 시간이 지나도 묻지 않는다', () => {
    const running = entryAgo(FEEDBACK_ASK_DELAY_MS * 2);
    expect(findPendingFeedback([running], NOW, running.id)).toBeNull();
  });

  it('이미 답한 기록은 묻지 않는다', () => {
    const answered = entryAgo(FEEDBACK_ASK_DELAY_MS + 1, { feedback: 'good' });
    expect(findPendingFeedback([answered], NOW)).toBeNull();
  });

  it('여러 개면 가장 최근 기록을 고른다', () => {
    const older = entryAgo(FEEDBACK_ASK_DELAY_MS * 3);
    const newer = entryAgo(FEEDBACK_ASK_DELAY_MS * 2);
    expect(findPendingFeedback([older, newer], NOW)).toBe(newer);
  });

  it('최근 기록에 답하면 같은 날 이전 기록을 이어서 묻는다', () => {
    const older = entryAgo(FEEDBACK_ASK_DELAY_MS * 3);
    const newer = entryAgo(FEEDBACK_ASK_DELAY_MS * 2);
    const answeredNewer = { ...newer, feedback: 'good' as const };
    expect(findPendingFeedback([older, answeredNewer], NOW)).toBe(older);
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

describe('isFeedbackAskable', () => {
  it('활동을 마친 기록은 바로 묻는다', () => {
    expect(isFeedbackAskable(entryAgo(1000, { durationSec: 600 }), NOW)).toBe(true);
  });

  it('마치지 않은 기록은 대기 시간이 지나야 묻는다', () => {
    expect(isFeedbackAskable(entryAgo(FEEDBACK_ASK_DELAY_MS - 1), NOW)).toBe(false);
    expect(isFeedbackAskable(entryAgo(FEEDBACK_ASK_DELAY_MS), NOW)).toBe(true);
  });

  it('답했거나 진행 중이거나 오래된 기록은 묻지 않는다', () => {
    expect(isFeedbackAskable(entryAgo(1000, { durationSec: 60, feedback: 'good' }), NOW)).toBe(false);
    const running = entryAgo(FEEDBACK_ASK_DELAY_MS * 2);
    expect(isFeedbackAskable(running, NOW, running.id)).toBe(false);
    expect(isFeedbackAskable(entryAgo(FEEDBACK_EXPIRE_MS, { durationSec: 60 }), NOW)).toBe(false);
  });
});
