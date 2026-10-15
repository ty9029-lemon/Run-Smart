import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import FeedbackChoices from './FeedbackChoices';

describe('FeedbackChoices', () => {
  const html = renderToStaticMarkup(<FeedbackChoices onSelect={() => {}} onLater={() => {}} />);

  it('추웠어요/적당했어요/더웠어요 선택지를 순서대로 보여준다', () => {
    const cold = html.indexOf('추웠어요');
    const good = html.indexOf('적당했어요');
    const hot = html.indexOf('더웠어요');
    expect(cold).toBeGreaterThan(-1);
    expect(good).toBeGreaterThan(cold);
    expect(hot).toBeGreaterThan(good);
  });

  it("'다음에 할게요'를 보여준다", () => {
    expect(html).toContain('다음에 할게요');
  });
});
