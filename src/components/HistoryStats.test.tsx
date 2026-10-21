import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HISTORY_MESSAGES } from '../constants/messages';
import type { HistoryEntry } from '../types';
import HistoryStats, { needsDistanceHint } from './HistoryStats';

/** 테스트용 기록 (필요한 값만 덮어쓴다) */
function entryWith(overrides: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    id: 'entry-1',
    date: '2026-10-20T10:23:00.000Z',
    activity: 'running',
    decision: 'go',
    weatherSummary: '18.6°C, 구름 조금, 바람 0.8m/s',
    guide: {
      guideMessage: '러닝하기 좋아요.',
      activityTips: [],
      warningLevel: 'good',
      goOrNotEmoji: '✅',
      detailedReason: '바람이 약해요.',
    },
    ...overrides,
  };
}

describe('needsDistanceHint', () => {
  it('활동을 마쳤는데 거리가 없으면 안내한다', () => {
    expect(needsDistanceHint(entryWith({ durationSec: 600 }))).toBe(true);
  });

  it('거리가 있으면 안내하지 않는다', () => {
    expect(needsDistanceHint(entryWith({ durationSec: 600, distanceKm: 5 }))).toBe(false);
  });

  it('아직 끝나지 않아 시간이 없으면 안내하지 않는다', () => {
    expect(needsDistanceHint(entryWith())).toBe(false);
  });
});

describe('HistoryStats', () => {
  it('거리가 없는 기록은 시간과 함께 거리 추가 안내를 보여준다', () => {
    const html = renderToStaticMarkup(<HistoryStats entry={entryWith({ durationSec: 11669 })} />);
    expect(html).toContain('3:14:29');
    // 안내 문구에도 "페이스"가 들어가므로 칸 이름(dt)만 확인한다
    expect(html).not.toContain(`>${HISTORY_MESSAGES.paceLabel}</dt>`);
    expect(html).toContain(HISTORY_MESSAGES.distanceHint);
  });

  it('거리가 있는 기록은 거리·페이스·시간을 보여주고 안내는 없다', () => {
    const html = renderToStaticMarkup(
      <HistoryStats entry={entryWith({ durationSec: 1800, distanceKm: 5 })} />,
    );
    expect(html).toContain('5km');
    expect(html).toContain(`>${HISTORY_MESSAGES.paceLabel}</dt>`);
    expect(html).not.toContain(HISTORY_MESSAGES.distanceHint);
  });

  it('보여줄 값이 없으면 아무것도 그리지 않는다', () => {
    expect(renderToStaticMarkup(<HistoryStats entry={entryWith()} />)).toBe('');
  });
});
