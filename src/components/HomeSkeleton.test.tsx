import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import HomeSkeleton from './HomeSkeleton';
import { MESSAGES } from '../constants/messages';
import { CTA_CLEARANCE } from '../constants/navigation';

describe('HomeSkeleton', () => {
  const html = renderToStaticMarkup(<HomeSkeleton />);

  it('로딩 상태를 스크린 리더에 알린다', () => {
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain(MESSAGES.homeLoading);
  });

  it('HomeReady와 같은 바닥 여백과 섹션 간격을 쓴다', () => {
    expect(html).toContain(`padding-bottom:${CTA_CLEARANCE}`);
    expect(html).toContain('space-y-10');
  });

  it('점수 링(88px)과 지표 6칸을 그린다', () => {
    expect(html).toContain('size-22');
    expect(html.match(/h-3\.5 w-10/g)).toHaveLength(6);
  });

  it('차트 막대 8개와 하단 고정 버튼 자리를 그린다', () => {
    expect(html.match(/rounded-t-lg/g)).toHaveLength(8);
    expect(html).toContain('fixed inset-x-0');
  });
});
