import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import AppLayout from './AppLayout';
import { PAGE_FADE_CLASS } from '../constants/motion';
import { TAB_BAR_OFFSET } from '../constants/navigation';

describe('AppLayout', () => {
  const html = renderToStaticMarkup(
    <MemoryRouter initialEntries={['/history']}>
      <AppLayout />
    </MemoryRouter>,
  );

  it('앱에 처음 들어온 화면은 페이드 없이 보여준다', () => {
    expect(html).not.toContain(PAGE_FADE_CLASS);
  });

  it('탭바에 가리지 않도록 하단 여백을 두고 탭바를 함께 그린다', () => {
    expect(html).toContain(`padding-bottom:${TAB_BAR_OFFSET}`);
    expect(html).toContain('aria-label="주요 메뉴"');
  });

  it('탭바 활성 색 전환에 fast 모션 토큰을 쓴다', () => {
    expect(html).toContain('transition-colors duration-(--motion-duration-fast)');
  });
});

describe('PAGE_FADE_CLASS', () => {
  it('tw-animate의 animate-in(transform 포함)을 쓰지 않는다', () => {
    expect(PAGE_FADE_CLASS).not.toContain('animate-in');
  });

  it('index.css의 전용 애니메이션이 fast 토큰·main 이징으로 opacity만 움직인다', () => {
    const css = readFileSync('src/index.css', 'utf8');
    expect(css).toContain(
      '--animate-page-in: fade-in-soft var(--motion-duration-fast) var(--motion-ease-main)',
    );
    const keyframes = css.slice(css.indexOf('@keyframes fade-in-soft'), css.indexOf('.fade-children'));
    expect(keyframes).not.toContain('transform');
  });
});
