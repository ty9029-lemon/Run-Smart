import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { ScoreReason } from '../lib/scoreReasons';
import ScoreReasonLine from './ScoreReasonLine';

/** 테스트용 항목 */
function makeReason(overrides: Partial<ScoreReason>): ScoreReason {
  return {
    key: 'dust',
    label: '미세먼지',
    points: 6,
    max: 15,
    penalty: 9,
    ratio: 0.6,
    capPenalty: 0,
    sensitive: false,
    ...overrides,
  };
}

/** 마크업 문자열로 렌더링 */
function render(reasons: ScoreReason[]): string {
  return renderToStaticMarkup(<ScoreReasonLine reasons={reasons} onOpenBreakdown={() => {}} />);
}

describe('ScoreReasonLine', () => {
  it('큰 감점 항목을 점수와 함께 보여준다', () => {
    const html = render([makeReason({}), makeReason({ key: 'wind', label: '바람', penalty: 5 })]);
    expect(html).toContain('미세먼지 −9점');
    expect(html).toContain('바람 −5점');
  });

  it('감점이 작으면 깎는 요인이 없다고 알린다', () => {
    expect(render([makeReason({ penalty: 1 })])).toContain('점수를 깎는 요인이 없어요');
  });

  it('민감 설정을 반영한 항목이면 안내를 붙인다', () => {
    expect(render([makeReason({ sensitive: true })])).toContain('내 설정을 반영해');
  });

  it('근거 시트를 여는 버튼이 있다', () => {
    expect(render([])).toContain('왜 이 점수예요?');
  });
});
