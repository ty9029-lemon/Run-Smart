import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import FeedbackForm, { buildFeedbackDetail } from './FeedbackForm';

describe('FeedbackForm', () => {
  const html = renderToStaticMarkup(<FeedbackForm onSave={() => {}} onLater={() => {}} />);

  it('추웠어요/적당했어요/더웠어요 선택지를 순서대로 보여준다', () => {
    const cold = html.indexOf('추웠어요');
    const good = html.indexOf('적당했어요');
    const hot = html.indexOf('더웠어요');
    expect(cold).toBeGreaterThan(-1);
    expect(good).toBeGreaterThan(cold);
    expect(hot).toBeGreaterThan(good);
  });

  it('거리·복장 입력과 저장, 다음에 할게요를 보여준다', () => {
    expect(html).toContain('몇 키로 뛰었나요?');
    expect(html).toContain('실제 착용한 복장');
    expect(html).toContain('저장');
    expect(html).toContain('다음에 할게요');
  });

  it('체감을 고르기 전에는 저장 버튼이 비활성이다', () => {
    const saveButton = html.match(/<button[^>]*>저장<\/button>/)?.[0] ?? '';
    expect(saveButton).toContain('disabled');
  });
});

describe('buildFeedbackDetail', () => {
  it('비워 두면 아무것도 저장하지 않는다', () => {
    expect(buildFeedbackDetail('', '  ')).toEqual({});
  });

  it('거리와 복장을 정리해서 담는다', () => {
    expect(buildFeedbackDetail('5.5', ' 반팔, 반바지 ')).toEqual({
      distanceKm: 5.5,
      actualOutfit: '반팔, 반바지',
    });
  });

  it('올바르지 않은 거리는 버린다', () => {
    expect(buildFeedbackDetail('abc', '반팔')).toEqual({ actualOutfit: '반팔' });
  });
});
