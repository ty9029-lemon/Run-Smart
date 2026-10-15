import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { DepartureStatus } from '../lib/departureStatus';
import DecisionButtons from './DecisionButtons';

/** 지정한 상태로 CTA 영역을 HTML 문자열로 그린다. */
function render(status: DepartureStatus, startedAt: number | null = null): string {
  return renderToStaticMarkup(
    <DecisionButtons
      status={status}
      activityLabel="러닝"
      activity="running"
      startedAt={startedAt}
      onDecide={() => {}}
      onEnd={() => {}}
      onCancel={() => {}}
    />,
  );
}

describe('DecisionButtons', () => {
  it('출발 전에는 출발 버튼을 보여준다', () => {
    expect(render('ready')).toContain('이대로 출발하기');
  });

  it('진행 중에는 경과 시간 타이머 버튼과 출발 취소를 보여준다', () => {
    const html = render('running', Date.now());
    expect(html).toContain('경과 시간');
    expect(html).toContain('00:00');
    expect(html).toContain('출발 취소');
    expect(html).not.toContain('이대로 출발하기');
  });

  it('종료 직후에는 종료 안내와 함께 출발 버튼도 보여준다', () => {
    const html = render('ended');
    expect(html).toContain('러닝을 마쳤어요');
    expect(html).toContain('이대로 출발하기');
  });

  it('종료 버튼 도입 전 기록은 출발 안내와 출발 취소를 보여준다', () => {
    const html = render('departed');
    expect(html).toContain('출발했어요');
    expect(html).toContain('출발 취소');
    expect(html).not.toContain('이대로 출발하기');
  });
});
