import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { ScoreReason } from '../lib/scoreReasons';
import { ReasonRow } from './ScoreBreakdownSheet';

/** 테스트용 점수 항목 (필요한 값만 덮어쓴다) */
function reasonWith(overrides: Partial<ScoreReason> = {}): ScoreReason {
  return {
    key: 'feelsLike',
    label: '체감온도',
    points: 24,
    max: 26,
    penalty: 2,
    ratio: 0.08,
    capPenalty: 0,
    sensitive: false,
    ...overrides,
  };
}

describe('ReasonRow', () => {
  it('깎인 점수를 받은 점수 왼쪽에 보여준다', () => {
    const html = renderToStaticMarkup(<ReasonRow reason={reasonWith()} value="15°C" />);
    expect(html).toContain('−2');
    expect(html).toContain('24/26점');
    expect(html.indexOf('−2')).toBeLessThan(html.indexOf('24/26점'));
  });

  it('미세먼지 상한이 걸리면 제한 안내와 추가 감점을 보여준다', () => {
    const html = renderToStaticMarkup(
      <ReasonRow
        reason={reasonWith({ key: 'dust', label: '미세먼지', points: 0, max: 15, penalty: 15, ratio: 1, capPenalty: 39 })}
        value="나쁨 (85)"
      />,
    );
    expect(html).toContain('0/15점');
    expect(html).toContain('미세먼지가 나빠 점수를 제한했어요');
    expect(html).toContain('추가 −39점');
  });

  it('상한이 걸리지 않으면 제한 안내를 보여주지 않는다', () => {
    const html = renderToStaticMarkup(<ReasonRow reason={reasonWith()} value="15°C" />);
    expect(html).not.toContain('점수를 제한했어요');
  });

  it('깎인 점수가 없으면 받은 점수만 보여준다', () => {
    const html = renderToStaticMarkup(
      <ReasonRow reason={reasonWith({ points: 26, penalty: 0, ratio: 0 })} value="15°C" />,
    );
    expect(html).toContain('26/26점');
    expect(html).not.toContain('−');
  });
});
