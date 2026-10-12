import { beforeEach, describe, expect, it } from 'vitest';
import { MS_PER_MINUTE } from '../constants/thresholds';
import { buildDummyGuide } from '../data/dummyGuide';
import { DUMMY_CURRENT_WEATHER } from '../data/dummyWeather';
import { NEUTRAL_SENSITIVITY } from '../lib/feelsLike';
import type { HistoryEntry, OutfitItem } from '../types';
import { dropRemovedEntries, useHistoryStore } from './historyStore';

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

describe('addEntry', () => {
  beforeEach(() => {
    useHistoryStore.setState({ entries: [] });
  });

  it('추천 복장을 기록과 함께 보존한다', () => {
    const outfit: OutfitItem[] = [{ category: 'top', icon: 'longSleeve', label: '긴팔 티셔츠' }];
    useHistoryStore.getState().addEntry({ ...makeEntry('a'), outfit });
    expect(useHistoryStore.getState().entries[0].outfit).toEqual(outfit);
  });
});

describe('addEntry (같은 날 같은 활동)', () => {
  beforeEach(() => {
    useHistoryStore.setState({ entries: [] });
  });

  it('출발할 때마다 각각 기록하고 최신순으로 둔다', () => {
    const { addEntry } = useHistoryStore.getState();
    const first = { ...makeEntry('first'), date: new Date(Date.now() - MS_PER_MINUTE).toISOString() };
    const second = { ...makeEntry('second'), date: new Date().toISOString() };
    addEntry(first);
    addEntry(second);
    expect(useHistoryStore.getState().entries.map((e) => e.id)).toEqual(['second', 'first']);
  });

  it('같은 id는 중복 없이 교체한다', () => {
    const { addEntry } = useHistoryStore.getState();
    addEntry(makeEntry('same'));
    addEntry(makeEntry('same'));
    expect(useHistoryStore.getState().entries).toHaveLength(1);
  });
});

describe('setFeedback', () => {
  beforeEach(() => {
    useHistoryStore.setState({ entries: [makeEntry('a'), makeEntry('b')] });
  });

  it('지정한 기록에만 피드백과 시각을 남긴다', () => {
    useHistoryStore.getState().setFeedback('a', 'cold');
    const [a, b] = useHistoryStore.getState().entries;
    expect(a.feedback).toBe('cold');
    expect(a.feedbackAt).toBeDefined();
    expect(b.feedback).toBeUndefined();
  });
});

describe('dropRemovedEntries', () => {
  it('안 가기(skip)와 외출 기록은 버리고 나머지는 남긴다', () => {
    const skip = { ...makeEntry('skip'), decision: 'skip' } as unknown as HistoryEntry;
    const outing = { ...makeEntry('outing'), activity: 'outing' } as unknown as HistoryEntry;
    const kept = makeEntry('go');
    expect(dropRemovedEntries([skip, outing, kept]).map((e) => e.id)).toEqual(['go']);
  });
});
