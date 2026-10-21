import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CONSTRAINTS } from '../constants/activities';
import ConstraintList from './ConstraintList';

describe('ConstraintList', () => {
  const html = renderToStaticMarkup(<ConstraintList selected={[]} onToggle={() => {}} />);

  it('항목마다 체크박스와 글자를 함께 감싼 줄 전체 라벨이 있다', () => {
    const labels = html.match(/<label[^>]*>[\s\S]*?<\/label>/g) ?? [];
    expect(labels).toHaveLength(CONSTRAINTS.length);
    labels.forEach((label) => {
      expect(label).toContain('role="checkbox"');
      expect(label).toContain('min-h-12');
    });
  });
});
