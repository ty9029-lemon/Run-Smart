import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { buildDummyGuide } from '../data/dummyGuide';
import { DUMMY_CURRENT_WEATHER } from '../data/dummyWeather';
import { NEUTRAL_SENSITIVITY } from '../lib/feelsLike';
import type { HistoryEntry } from '../types';
import HistoryEntryMenu from './HistoryEntryMenu';

/** 테스트용 기록 */
const ENTRY: HistoryEntry = {
  id: 'e1',
  date: new Date('2026-10-15T07:30:00').toISOString(),
  activity: 'running',
  decision: 'go',
  weatherSummary: '',
  guide: buildDummyGuide('running', DUMMY_CURRENT_WEATHER, NEUTRAL_SENSITIVITY, []),
  distanceKm: 4.1,
  actualOutfit: '나이키 반팔',
};

describe('HistoryEntryMenu', () => {
  it('닫혀 있을 때는 더보기 버튼만 보이고 시트·팝업은 없다', () => {
    const html = renderToStaticMarkup(<HistoryEntryMenu entry={ENTRY} daysAgo={0} />);
    expect(html).toContain('기록 더보기');
    expect(html).not.toContain('기록 수정');
    expect(html).not.toContain('삭제할까요');
  });
});
