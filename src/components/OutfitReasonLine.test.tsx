import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import OutfitReasonLine from './OutfitReasonLine';

describe('OutfitReasonLine', () => {
  it('기본 근거와 조건 근거를 보여준다', () => {
    const html = renderToStaticMarkup(
      <OutfitReasonLine
        reason={{ base: '체감 7°C 구간이라 긴팔 차림으로 맞췄어요.', extras: ['비가 와서 우비'] }}
      />,
    );
    expect(html).toContain('체감 7°C');
    expect(html).toContain('비가 와서 우비');
  });

  it('기본 근거와 조건 근거를 줄바꿈 없이 한 문단으로 이어 보여준다', () => {
    const html = renderToStaticMarkup(
      <OutfitReasonLine
        reason={{
          base: '기본 근거',
          extras: ['비가 와서 우비를 챙기면 좋아요.', '바람이 강해 윈드 재킷을 챙기면 좋아요.'],
        }}
      />,
    );
    expect(html.match(/<p/g)).toHaveLength(1);
    expect(html).toContain(
      '기본 근거 비가 와서 우비를 챙기면 좋아요. 바람이 강해 윈드 재킷을 챙기면 좋아요.',
    );
    expect(html).not.toContain(' · ');
  });

  it('조건 근거가 없으면 기본 근거만 보여준다', () => {
    const html = renderToStaticMarkup(
      <OutfitReasonLine reason={{ base: '기본 근거', extras: [] }} />,
    );
    expect(html).toContain('기본 근거');
    expect(html.match(/<p/g)).toHaveLength(1);
  });
});
