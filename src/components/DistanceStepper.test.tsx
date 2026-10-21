import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import DistanceStepper from './DistanceStepper';

/** 거리 입력창을 그려 HTML로 돌려준다 */
function render(value: string): string {
  return renderToStaticMarkup(<DistanceStepper value={value} invalid={false} onChange={() => {}} />);
}

/** 단위 "km"를 감싼 span의 class */
function unitClass(html: string): string {
  return html.match(/<span[^>]*class="([^"]*)"[^>]*>km<\/span>/)?.[1] ?? '';
}

describe('DistanceStepper', () => {
  it('입력 전에는 기본값(5)을 placeholder로 보여주고 입력창 글자색을 흰색으로 덮지 않는다', () => {
    const html = render('');
    expect(html).toContain('placeholder="5"');
    expect(html).not.toContain('placeholder:text-foreground');
  });

  it('입력 전에는 단위 km도 placeholder와 같은 회색이다', () => {
    const unit = unitClass(render(''));
    expect(unit).toContain('text-placeholder');
    expect(unit).not.toContain('text-foreground');
  });

  it('값을 입력하면 단위 km가 값과 같은 흰색이 된다', () => {
    const unit = unitClass(render('5.5'));
    expect(unit).toContain('text-foreground');
    expect(unit).not.toContain('text-placeholder');
  });
});
