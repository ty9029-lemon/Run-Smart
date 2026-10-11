import { describe, expect, it } from 'vitest';
import { formatDepartureToast } from './messages';

describe('formatDepartureToast', () => {
  it('활동명을 넣어 출발 안내 문구를 만든다', () => {
    expect(formatDepartureToast('러닝')).toBe(
      '즐거운 러닝 되세요!\n돌아오시면 착장 피드백을 반영해 드릴게요.',
    );
  });
});
