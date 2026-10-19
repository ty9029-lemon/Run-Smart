import { describe, expect, it } from 'vitest';
import {
  formatDepartedNotice,
  formatDepartureToast,
  formatEndDialogDescription,
  formatEndDialogTitle,
  formatEndedNotice,
  formatRecommendSummary,
  formatTimerButtonLabel,
} from './messages';

describe('formatDepartureToast', () => {
  it('활동명을 넣어 출발 안내 문구를 만든다', () => {
    expect(formatDepartureToast('러닝')).toBe(
      '즐거운 러닝 되세요!\n끝나고 더웠는지 추웠는지 알려주세요.',
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

describe('formatEndedNotice', () => {
  it('받침 유무에 맞는 조사로 종료 안내 문구를 만든다', () => {
    expect(formatEndedNotice('러닝')).toBe('러닝을 마쳤어요. 수고하셨어요!');
    expect(formatEndedNotice('자전거')).toBe('자전거를 마쳤어요. 수고하셨어요!');
  });
});

describe('formatTimerButtonLabel', () => {
  it('활동명과 경과 시간을 읽어 주고 종료 확인이 열린다고 알려 준다', () => {
    expect(formatTimerButtonLabel('러닝', '1:00:01')).toBe(
      '러닝 경과 시간 1:00:01, 누르면 종료 확인',
    );
  });
});

describe('종료 확인 팝업 문구', () => {
  it('받침 유무에 맞는 조사로 제목을 만든다', () => {
    expect(formatEndDialogTitle('러닝')).toBe('러닝을 종료할까요?');
    expect(formatEndDialogTitle('자전거')).toBe('자전거를 종료할까요?');
  });

  it('경과 시간을 넣어 설명을 만든다', () => {
    expect(formatEndDialogDescription('00:07')).toBe('지금까지 00:07 동안 기록했어요.');
  });
});
