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

  it('깎인 점수가 없으면 받은 점수만 보여준다', () => {
    const html = renderToStaticMarkup(
      <ReasonRow reason={reasonWith({ points: 26, penalty: 0, ratio: 0 })} value="15°C" />,
    );
    expect(html).toContain('26/26점');
    expect(html).not.toContain('−');
  });
});
