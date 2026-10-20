import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { ScoreDelta } from '../lib/scoreReasons';
import ScoreDeltaLine from './ScoreDeltaLine';

describe('ScoreDeltaLine', () => {
  it('올라간 항목은 +, 내려간 항목은 −로 보여준다', () => {
    const deltas: ScoreDelta[] = [
      { key: 'wind', label: '바람', diff: 4 },
      { key: 'dust', label: '미세먼지', diff: -3 },
    ];
    const html = renderToStaticMarkup(<ScoreDeltaLine deltas={deltas} />);
    expect(html).toContain('지금보다');
    expect(html).toContain('+4점');
    expect(html).toContain('−3점');
  });

  it('차이가 없으면 비슷한 조건이라고 알린다', () => {
    expect(renderToStaticMarkup(<ScoreDeltaLine deltas={[]} />)).toContain(
      '지금과 비슷한 조건이에요',
    );
  });
});
