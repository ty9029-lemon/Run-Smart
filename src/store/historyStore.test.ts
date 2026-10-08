import { beforeEach, describe, expect, it } from 'vitest';
import { buildDummyGuide } from '../data/dummyGuide';
import { DUMMY_CURRENT_WEATHER } from '../data/dummyWeather';
import { NEUTRAL_SENSITIVITY } from '../lib/feelsLike';
import type { HistoryEntry } from '../types';
import { useHistoryStore } from './historyStore';

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

describe('removeEntry', () => {
  beforeEach(() => {
    useHistoryStore.setState({ entries: [makeEntry('a'), makeEntry('b')] });
  });

  it('지정한 id의 기록만 삭제한다', () => {
    useHistoryStore.getState().removeEntry('a');
    expect(useHistoryStore.getState().entries.map((e) => e.id)).toEqual(['b']);
  });

  it('없는 id면 아무것도 바꾸지 않는다', () => {
    useHistoryStore.getState().removeEntry('missing');
    expect(useHistoryStore.getState().entries).toHaveLength(2);
  });
});
