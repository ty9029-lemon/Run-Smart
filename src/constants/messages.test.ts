import { describe, expect, it } from 'vitest';
import { formatDepartedNotice, formatDepartureToast, formatRecommendSummary } from './messages';

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

describe('formatRecommendSummary', () => {
  it('연속 구간이 있으면 구간과 최고 시각을 보여준다', () => {
    expect(
      formatRecommendSummary({ hour: 19, score: 92 }, { startHour: 18, endHour: 20 }),
    ).toBe('추천 시간대 18~20시 (최고 19시 92점)');
  });

  it('구간이 없으면 대표 시각만 보여준다', () => {
    expect(formatRecommendSummary({ hour: 7, score: 85 }, null)).toBe('추천 시간대 7시 (85점)');
  });

  it('추천 기준에 못 미치면 조심 안내로 바꾼다', () => {
    expect(formatRecommendSummary({ hour: 6, score: 61 }, null)).toBe(
      '오늘은 전반적으로 조심하세요. 그나마 6시(61점)가 가장 나아요.',
    );
  });
});
