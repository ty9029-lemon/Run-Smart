import { describe, expect, it } from 'vitest';
import { formatDepartedNotice, formatDepartureToast } from './messages';

describe('formatDepartureToast', () => {
  it('활동명을 넣어 출발 안내 문구를 만든다', () => {
    expect(formatDepartureToast('러닝')).toBe(
      '즐거운 러닝 되세요!\n돌아오시면 착장 피드백을 반영해 드릴게요.',
    );
  });
});

describe('formatDepartedNotice', () => {
  it('받침 유무에 맞는 조사로 출발 안내 문구를 만든다', () => {
    expect(formatDepartedNotice('러닝')).toBe('러닝을 출발했어요. 잠시 뒤에 다시 만나요.');
    expect(formatDepartedNotice('자전거')).toBe('자전거를 출발했어요. 잠시 뒤에 다시 만나요.');
  });
});
