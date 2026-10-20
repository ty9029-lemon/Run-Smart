import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SPLASH_LOGO_URL } from '../constants/splash';
import SplashScreen from './SplashScreen';

describe('SplashScreen', () => {
  const html = renderToStaticMarkup(<SplashScreen onFinish={() => {}} />);

  it('앱 이름을 이탤릭으로 보여준다', () => {
    expect(html).toContain('Run Smart');
    expect(html).toContain('italic');
  });

  it('로고 이미지를 마스크로 사용한다', () => {
    expect(html).toContain(SPLASH_LOGO_URL);
  });

  it('스크린 리더에는 숨긴다', () => {
    expect(html).toContain('aria-hidden="true"');
  });
});
