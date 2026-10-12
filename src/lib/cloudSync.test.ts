import { describe, expect, it } from 'vitest';
import { buildDummyGuide } from '../data/dummyGuide';
import { DUMMY_CURRENT_WEATHER } from '../data/dummyWeather';
import type { HistoryEntry } from '../types';
import { diffHistory, mergeHistory } from './cloudSync';
import { NEUTRAL_SENSITIVITY } from './feelsLike';
import { fromHistoryRow, toHistoryRow } from './historyRepo';

/** 테스트용 기록 항목 */
function makeEntry(id: string, date = '2026-01-01T00:00:00.000Z'): HistoryEntry {
  return {
    id,
    date,
    activity: 'running',
    decision: 'go',
    weatherSummary: '',
    guide: buildDummyGuide('running', DUMMY_CURRENT_WEATHER, NEUTRAL_SENSITIVITY, []),
  };
}

describe('diffHistory', () => {
  it('추가·수정된 기록과 삭제된 id를 구분한다', () => {
    const a = makeEntry('a');
    const b = makeEntry('b');
    const bChanged = { ...b, feedback: 'good' as const };
    const c = makeEntry('c');
    const diff = diffHistory([a, b], [bChanged, c]);
    expect(diff.upserted.map((e) => e.id)).toEqual(['b', 'c']);
    expect(diff.removedIds).toEqual(['a']);
  });
});

describe('mergeHistory', () => {
  it('같은 id는 서버를 우선하고 서버에 없는 기록은 올릴 대상으로 돌려준다', () => {
    const remoteA = { ...makeEntry('a'), feedback: 'cold' as const };
    const localA = makeEntry('a');
    const localB = makeEntry('b', '2026-02-01T00:00:00.000Z');
    const { merged, localOnly } = mergeHistory([localA, localB], [remoteA]);
    expect(merged.map((e) => e.id)).toEqual(['b', 'a']);
    expect(merged[1].feedback).toBe('cold');
    expect(localOnly.map((e) => e.id)).toEqual(['b']);
  });
});

describe('기록 행 변환', () => {
  it('저장했다 읽어도 같은 기록이 된다', () => {
    const entry = { ...makeEntry('a'), feelsLike: 3.5, feedback: 'hot' as const };
    const row = toHistoryRow(entry, 'user-1');
    expect(row.user_id).toBe('user-1');
    expect(fromHistoryRow(row)).toEqual(entry);
  });

  it('값이 없는 선택 필드는 null로 저장하고 읽을 때 생략한다', () => {
    const row = toHistoryRow(makeEntry('a'), 'user-1');
    expect(row.feels_like).toBeNull();
    expect(fromHistoryRow(row)).not.toHaveProperty('feelsLike');
  });
});
