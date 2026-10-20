import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ScoreRing from './ScoreRing';

describe('ScoreRing', () => {
  const html = renderToStaticMarkup(<ScoreRing score={93} />);

  it('점수를 접근성 이름과 숫자로 보여준다', () => {
    expect(html).toContain('활동 지수 93점');
    expect(html).toContain('>93<');
  });

  it('링이 차오르는 전환에 slow 모션 토큰을 쓴다', () => {
    expect(html).toContain('transition-[stroke-dashoffset]');
    expect(html).toContain('duration-(--motion-duration-slow)');
    expect(html).toContain('ease-(--motion-ease-main)');
  });
});
