import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ReminderInterestButton from './ReminderInterestButton';

/** 지정한 상태로 버튼 영역을 HTML 문자열로 그린다. */
function render(isRequested: boolean): string {
  return renderToStaticMarkup(
    <ReminderInterestButton hourLabel="오후 6시" isRequested={isRequested} onRequest={() => {}} activity="running" />,
  );
}

describe('ReminderInterestButton', () => {
  it('아직 누르지 않았으면 선택한 시각이 들어간 버튼을 보여준다', () => {
    const html = render(false);
    expect(html).toContain('오후 6시 러닝 알림 받기');
    expect(html).toContain('<button');
  });

  it('누른 뒤에는 버튼 대신 준비 중 안내를 보여준다', () => {
    const html = render(true);
    expect(html).toContain('아직 준비 중');
    expect(html).not.toContain('<button');
  });
});
