import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { buildDummyGuide } from '../data/dummyGuide';
import { DUMMY_CURRENT_WEATHER } from '../data/dummyWeather';
import { NEUTRAL_SENSITIVITY } from '../lib/feelsLike';
import type { HistoryEntry } from '../types';
import HistoryEntryStatus from './HistoryEntryStatus';

/** 테스트용 기록 */
function makeEntry(patch: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    id: 'e1',
    date: new Date('2026-10-15T07:30:00').toISOString(),
    activity: 'running',
    decision: 'go',
    weatherSummary: '',
    guide: buildDummyGuide('running', DUMMY_CURRENT_WEATHER, NEUTRAL_SENSITIVITY, []),
    ...patch,
  };
}

/** 기록의 상태 영역을 HTML 문자열로 그린다. */
function render(
  entry: HistoryEntry,
  runningStartedAt: number | null = null,
  askFeedback = false,
): string {
  return renderToStaticMarkup(
    <HistoryEntryStatus entry={entry} runningStartedAt={runningStartedAt} askFeedback={askFeedback} />,
  );
}

describe('HistoryEntryStatus', () => {
  it('활동을 마친 기록은 시작 시각 옆에 활동 시간을 붙인다', () => {
    expect(render(makeEntry({ durationSec: 21 * 60 + 5 }))).toContain('21분 5초');
  });

  it('종료하지 않은 기록은 시각만 보여준다', () => {
    const html = render(makeEntry());
    expect(html).not.toContain('분');
    expect(html).not.toContain('진행 중');
  });

  it('진행 중이면 진행 중 표시와 경과 시간을 보여준다', () => {
    const html = render(makeEntry(), Date.now());
    expect(html).toContain('진행 중');
    expect(html).toContain('00:00');
  });

  it('체감을 남긴 기록은 체감 결과를 보여주고 선택지를 숨긴다', () => {
    const html = render(makeEntry({ durationSec: 60, feedback: 'cold' }), null, true);
    expect(html).toContain('추웠어요');
    expect(html).not.toContain('체감은 어땠나요?');
  });

  it('체감을 물어볼 수 있는 기록은 선택지를 보여준다', () => {
    const html = render(makeEntry({ durationSec: 60 }), null, true);
    expect(html).toContain('체감은 어땠나요?');
    expect(html).toContain('적당했어요');
    expect(html).not.toContain('다음에 할게요');
  });

  it('물어볼 수 없는 기록은 선택지를 보여주지 않는다', () => {
    expect(render(makeEntry({ durationSec: 60 }), null, false)).not.toContain('체감은 어땠나요?');
  });
});
