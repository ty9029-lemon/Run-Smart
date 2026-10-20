import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TooltipProvider } from './ui/tooltip';
import ProfileForm from './ProfileForm';
import { DEFAULT_PROFILE } from '../store/profileStore';

/** 설정 폼을 그려 본 HTML */
function renderForm(activityTimeSlots: typeof DEFAULT_PROFILE.activityTimeSlots): string {
  return renderToStaticMarkup(
    <TooltipProvider>
      <ProfileForm draft={{ ...DEFAULT_PROFILE, activityTimeSlots }} error="" onChange={() => {}} />
    </TooltipProvider>,
  );
}

describe('ProfileForm 시간대 선택', () => {
  it('활동 선택 카드 아래에 시간대 6종을 보여준다', () => {
    const html = renderForm([]);
    expect(html).toContain('시간대 선택');
    for (const label of ['출근 전', '퇴근 후', '평일 낮', '주말 아침', '주말 저녁', '항상 다름']) {
      expect(html).toContain(label);
    }
    expect(html.indexOf('활동 선택')).toBeLessThan(html.indexOf('시간대 선택'));
    expect(html.indexOf('시간대 선택')).toBeLessThan(html.indexOf('추위·더위 민감도'));
  });

  it('저장된 시간대는 선택된 상태로 보여준다', () => {
    const selected = renderForm(['afterWork']);
    const none = renderForm([]);
    expect(selected).not.toBe(none);
    expect(selected).toContain('aria-pressed="true"');
  });
});
