import { describe, expect, it } from 'vitest';
import { detectInAppBrowser } from './inAppBrowser';

const SAFARI_IOS =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const CHROME_ANDROID =
  'Mozilla/5.0 (Linux; Android 13; SM-S918N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const CHROME_IOS =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1';
const INSTAGRAM_IOS =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21A329 Instagram 300.0.0.29.110 (iPhone14,5; iOS 17_0; ko_KR)';
const KAKAOTALK_ANDROID =
  'Mozilla/5.0 (Linux; Android 13; SM-S918N Build/TP1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36 KAKAOTALK 2510090';
const NAVER_IOS =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 NAVER(inapp; search; 1000; 12.0)';
const THREADS_IOS =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21A329 Barcelona 300.0.0.0.0';
const X_IOS =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Twitter for iPhone/10.0';
const UNKNOWN_ANDROID_WEBVIEW =
  'Mozilla/5.0 (Linux; Android 13; Pixel 7; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36';

describe('detectInAppBrowser', () => {
  it('일반 브라우저는 인앱이 아니다', () => {
    const notInApp = { isInAppBrowser: false, inAppBrowserName: 'none' };
    expect(detectInAppBrowser(SAFARI_IOS)).toEqual(notInApp);
    expect(detectInAppBrowser(CHROME_ANDROID)).toEqual(notInApp);
    expect(detectInAppBrowser(CHROME_IOS)).toEqual(notInApp);
  });

  it('User-Agent가 비어 있으면 인앱이 아니다', () => {
    expect(detectInAppBrowser('')).toEqual({ isInAppBrowser: false, inAppBrowserName: 'none' });
  });

  it('앱 이름을 알아낸다', () => {
    expect(detectInAppBrowser(INSTAGRAM_IOS).inAppBrowserName).toBe('instagram');
    expect(detectInAppBrowser(KAKAOTALK_ANDROID).inAppBrowserName).toBe('kakaotalk');
    expect(detectInAppBrowser(NAVER_IOS).inAppBrowserName).toBe('naver');
    expect(detectInAppBrowser(THREADS_IOS).inAppBrowserName).toBe('threads');
    expect(detectInAppBrowser(X_IOS).inAppBrowserName).toBe('x');
  });

  it('앱을 특정하지 못한 웹뷰는 webview로 분류한다', () => {
    expect(detectInAppBrowser(UNKNOWN_ANDROID_WEBVIEW)).toEqual({
      isInAppBrowser: true,
      inAppBrowserName: 'webview',
    });
  });
});
