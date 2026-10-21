import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import SplashScreen from './SplashScreen';

describe('SplashScreen', () => {
  const html = renderToStaticMarkup(<SplashScreen onFinish={() => {}} />);

  it('앱 이름을 이탤릭으로 보여준다', () => {
    expect(html).toContain('Run Smart');
    expect(html).toContain('italic');
  });

  it('로고 이미지를 마스크로 사용한다', () => {
    expect(html).toContain('mask-image:url(');
  });

  it('로고는 번들에 포함한 데이터 URI라 네트워크 요청 없이 문구와 같이 그려진다', () => {
    expect(html).toContain('mask-image:url(&quot;data:image/svg+xml');
    expect(html).not.toContain('/logo-mark.svg');
  });

  it('스크린 리더에는 숨긴다', () => {
    expect(html).toContain('aria-hidden="true"');
  });
});
