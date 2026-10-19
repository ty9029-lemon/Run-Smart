import type { ComponentProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import HourlyChart from './HourlyChart';

/** 시간대 데이터 없이 제목만 확인하는 최소 속성 */
const BASE: ComponentProps<typeof HourlyChart> = {
  hourly: [],
  scores: [],
  selectedHour: null,
  onSelectHour: () => {},
  best: null,
  range: null,
  activityLabel: '러닝',
  sunsetStatus: null,
};

describe('HourlyChart 제목', () => {
  it('오늘 추천이 없으면 다음 추천 시간을 함께 안내한다', () => {
    const html = renderToStaticMarkup(
      <HourlyChart {...BASE} nextRecommendation={{ label: '내일 오전', hour: 7 }} />,
    );
    expect(html).toContain('오늘은 추천할 러닝 시간이 없어요.');
    expect(html).toContain('내일 오전 7시가 가장 좋아요');
  });

  it('다음 추천이 없으면 없다는 안내만 한다', () => {
    const html = renderToStaticMarkup(<HourlyChart {...BASE} />);
    expect(html).toContain('오늘은 추천할 러닝 시간이 없어요.');
    expect(html).not.toContain('가장 좋아요');
  });

  it('연속 구간이 있으면 구간을 제목에 강조한다', () => {
    const html = renderToStaticMarkup(
      <HourlyChart
        {...BASE}
        best={{ hour: 19, score: 90 }}
        range={{ startHour: 18, endHour: 20 }}
      />,
    );
    expect(html).toContain('18~20시');
    expect(html).toContain('러닝하기 좋아요');
  });
});

describe('HourlyChart 스크롤바', () => {
  it('처음에는 스크롤 중이 아니라 스크롤바를 숨긴다', () => {
    const html = renderToStaticMarkup(<HourlyChart {...BASE} />);
    expect(html).toContain('data-scrolling="false"');
    expect(html).toContain('chart-scrollbar');
  });
});
