import { describe, expect, it } from 'vitest';
import { hasIntroPlayed, markIntroPlayed } from './introPlayed';

describe('등장 모션 기록', () => {
  it('처음에는 보여주지 않은 상태다', () => {
    expect(hasIntroPlayed('test-first')).toBe(false);
  });

  it('보여줬다고 기록하면 이후에는 보여준 상태다', () => {
    markIntroPlayed('test-played');
    expect(hasIntroPlayed('test-played')).toBe(true);
  });

  it('키가 다르면 서로 영향을 주지 않는다', () => {
    markIntroPlayed('test-a');
    expect(hasIntroPlayed('test-b')).toBe(false);
  });
});
