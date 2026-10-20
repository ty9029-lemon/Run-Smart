import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import StepIndicator from './StepIndicator';

describe('StepIndicator', () => {
  const html = renderToStaticMarkup(<StepIndicator current={1} total={4} />);

  it('막대 색 전환에 모션 토큰을 쓴다', () => {
    expect(html).toContain('transition-colors');
    expect(html).toContain('duration-(--motion-duration-fast)');
    expect(html).toContain('ease-(--motion-ease-main)');
  });

  it('단계 제목이 있으면 단계가 바뀔 때 읽어 줄 안내를 숨겨서 둔다', () => {
    const withTitle = renderToStaticMarkup(
      <StepIndicator current={1} total={4} stepTitle="추위·더위를 얼마나 타세요?" />,
    );
    expect(withTitle).toContain('role="status"');
    expect(withTitle).toContain('aria-live="polite"');
    expect(withTitle).toContain('sr-only');
    expect(withTitle).toContain('4단계 중 2단계, 추위·더위를 얼마나 타세요?');
  });

  it('단계 제목이 없으면 안내를 만들지 않는다', () => {
    expect(html).not.toContain('role="status"');
  });

  it('현재 단계까지 막대를 채우고 단계 수를 알려준다', () => {
    expect(html.match(/bg-lime-pulse/g)).toHaveLength(2);
    expect(html).toContain('4단계 중 2단계');
  });
});
