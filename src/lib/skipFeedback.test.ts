import { beforeEach, describe, expect, it } from 'vitest';
import { FEEDBACK_SOURCES } from '../constants/feedback';
import { buildDummyGuide } from '../data/dummyGuide';
import { DUMMY_CURRENT_WEATHER } from '../data/dummyWeather';
import { useHistoryStore } from '../store/historyStore';
import type { HistoryEntry } from '../types';
import { NEUTRAL_SENSITIVITY } from './feelsLike';
import { skipFeedback } from './skipFeedback';

/** 테스트용 기록 항목 */
function makeEntry(id: string): HistoryEntry {
  return {
    id,
    date: new Date().toISOString(),
    activity: 'running',
    decision: 'go',
    weatherSummary: '',
    guide: buildDummyGuide('running', DUMMY_CURRENT_WEATHER, NEUTRAL_SENSITIVITY, []),
  };
}

describe('skipFeedback', () => {
  beforeEach(() => {
    useHistoryStore.setState({ entries: [makeEntry('a'), makeEntry('b')] });
  });

  it('저장 안 하기로 한 기록만 기록에서 지운다', () => {
    skipFeedback(makeEntry('a'), FEEDBACK_SOURCES.sheet);
    expect(useHistoryStore.getState().entries.map((e) => e.id)).toEqual(['b']);
  });

  it('홈 카드에서 눌러도 같은 기록을 지운다', () => {
    skipFeedback(makeEntry('b'), FEEDBACK_SOURCES.card);
    expect(useHistoryStore.getState().entries.map((e) => e.id)).toEqual(['a']);
  });
});
