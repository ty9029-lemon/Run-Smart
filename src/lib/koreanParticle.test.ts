import { describe, expect, it } from 'vitest';
import { withObjectParticle } from './koreanParticle';

describe('withObjectParticle', () => {
  it('받침이 있으면 을을 붙인다', () => {
    expect(withObjectParticle('러닝')).toBe('러닝을');
    expect(withObjectParticle('등산')).toBe('등산을');
    expect(withObjectParticle('산책')).toBe('산책을');
  });

  it('받침이 없으면 를을 붙인다', () => {
    expect(withObjectParticle('자전거')).toBe('자전거를');
  });

  it('한글로 끝나지 않으면 을(를)을 붙인다', () => {
    expect(withObjectParticle('Run')).toBe('Run을(를)');
    expect(withObjectParticle('')).toBe('을(를)');
  });
});
