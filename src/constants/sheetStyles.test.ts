import { describe, expect, it } from 'vitest';
import { BOTTOM_SHEET_CLASS } from './sheetStyles';

describe('BOTTOM_SHEET_CLASS', () => {
  it('열릴 때는 normal, 닫힐 때는 fast 모션 토큰을 쓴다', () => {
    expect(BOTTOM_SHEET_CLASS).toContain('data-open:duration-(--motion-duration-normal)');
    expect(BOTTOM_SHEET_CLASS).toContain('data-closed:duration-(--motion-duration-fast)');
  });

  it('아래에서 올라오고 아래로 내려간다', () => {
    expect(BOTTOM_SHEET_CLASS).toContain('data-open:slide-in-from-bottom');
    expect(BOTTOM_SHEET_CLASS).toContain('data-closed:slide-out-to-bottom');
  });
});
