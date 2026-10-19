import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import BestTimeSection from './BestTimeSection';

const TODAY = { label: '오늘 퇴근 후', hour: 19, score: 84 };
const TOMORROW = { label: '내일 출근 전', hour: 7, score: 82 };

describe('BestTimeSection', () => {
  it('카드가 없으면 아무것도 그리지 않는다', () => {
    expect(renderToStaticMarkup(<BestTimeSection cards={[]} />)).toBe('');
  });

  it('카드가 한 장이면 시각과 배지·점수를 한 줄에 나란히 놓고 오른쪽 끝에 붙인다', () => {
    const html = renderToStaticMarkup(<BestTimeSection cards={[TODAY]} />);
    expect(html).toContain('justify-between');
    expect(html).toContain('19:00');
    expect(html).toContain('84점');
  });

  it('카드가 두 장이면 각 카드 안에서 시각 아래에 배지와 점수를 쌓는다', () => {
    const html = renderToStaticMarkup(<BestTimeSection cards={[TODAY, TOMORROW]} />);
    expect(html).not.toContain('justify-between');
    expect(html).toContain('오늘 퇴근 후');
    expect(html).toContain('내일 출근 전');
    expect(html).toContain('07:00');
  });

  it('점수가 좋음 미만이면 배지를 외곽선과 레벨 색으로 그린다', () => {
    const html = renderToStaticMarkup(
      <BestTimeSection cards={[{ label: '오늘 가장 좋은 시간', hour: 8, score: 60 }]} />,
    );
    expect(html).toContain('보통');
    expect(html).toContain('text-level-normal');
  });
});
