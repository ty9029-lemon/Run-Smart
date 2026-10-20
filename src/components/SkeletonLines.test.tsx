import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import SkeletonLines from './SkeletonLines';

describe('SkeletonLines', () => {
  it('폭 배열의 길이만큼 줄을 그린다', () => {
    const html = renderToStaticMarkup(<SkeletonLines widths={['w-full', 'w-1/2', 'w-1/3']} />);
    expect(html.match(/data-slot="skeleton"/g)).toHaveLength(3);
    expect(html).toContain('w-1/2');
  });

  it('기본은 4줄이고 스크린 리더에는 숨긴다', () => {
    const html = renderToStaticMarkup(<SkeletonLines />);
    expect(html.match(/data-slot="skeleton"/g)).toHaveLength(4);
    expect(html).toContain('aria-hidden="true"');
  });

  it('줄 높이를 본문 한 줄(24px)에 맞춘다', () => {
    expect(renderToStaticMarkup(<SkeletonLines />)).toContain('h-6');
  });
});
