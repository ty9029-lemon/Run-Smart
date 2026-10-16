import { describe, expect, it } from 'vitest';
import { buildDummyGuide } from '../data/dummyGuide';
import { DUMMY_CURRENT_WEATHER } from '../data/dummyWeather';
import type { HistoryEntry } from '../types';
import { NEUTRAL_SENSITIVITY } from './feelsLike';
import { fromHistoryRow, toHistoryRow } from './historyRepo';

const USER_ID = 'user-1';

/** 테스트용 기록 */
function makeEntry(extra: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    id: 'a',
    date: new Date().toISOString(),
    activity: 'running',
    decision: 'go',
    weatherSummary: '',
    guide: buildDummyGuide('running', DUMMY_CURRENT_WEATHER, NEUTRAL_SENSITIVITY, []),
    ...extra,
  };
}

describe('기록 거리·복장 매핑', () => {
  it('거리와 복장이 DB 행으로 갔다가 그대로 돌아온다', () => {
    const entry = makeEntry({ distanceKm: 5.5, actualOutfit: '반팔, 반바지' });
    const restored = fromHistoryRow(toHistoryRow(entry, USER_ID));
    expect(restored.distanceKm).toBe(5.5);
    expect(restored.actualOutfit).toBe('반팔, 반바지');
  });

  it('입력하지 않았으면 null로 저장하고 돌아올 때 필드를 생략한다', () => {
    const row = toHistoryRow(makeEntry(), USER_ID);
    expect(row.distance_km).toBeNull();
    expect(row.actual_outfit).toBeNull();
    const restored = fromHistoryRow(row);
    expect('distanceKm' in restored).toBe(false);
    expect('actualOutfit' in restored).toBe(false);
  });

  it('서버가 거리를 문자열(numeric)로 줘도 숫자로 바꾼다', () => {
    const row = { ...toHistoryRow(makeEntry(), USER_ID), distance_km: '5.5' as unknown as number };
    expect(fromHistoryRow(row).distanceKm).toBe(5.5);
  });
});
