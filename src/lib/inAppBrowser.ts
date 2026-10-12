import { IN_APP_BROWSER_NONE } from '../constants/analytics';

/** 인앱 브라우저 판별 결과 */
export interface InAppBrowserInfo {
  /** 앱 안의 웹뷰로 열렸는지 */
  isInAppBrowser: boolean;
  /** 앱 이름 (일반 브라우저면 'none', 앱을 특정하지 못한 웹뷰는 'webview') */
  inAppBrowserName: string;
}

/**
 * 인앱 브라우저 User-Agent 패턴 (앞에서부터 먼저 맞는 항목을 쓴다).
 * 스레드는 UA에 내부 코드명(Barcelona)이 들어가므로 인스타그램보다 먼저 검사한다.
 */
const IN_APP_BROWSER_PATTERNS: ReadonlyArray<readonly [name: string, pattern: RegExp]> = [
  ['threads', /Barcelona/i],
  ['instagram', /Instagram/i],
  ['facebook', /FBAN|FBAV|FB_IAB/i],
  ['x', /\bTwitter(?:ForiPhone|Android)?\b|Twitter for/i],
  ['kakaotalk', /KAKAOTALK/i],
  ['naver', /NAVER\(inapp/i],
  ['line', /\bLine\//i],
  ['band', /\bBAND\//i],
  ['daum', /DaumApps/i],
  ['tiktok', /musical_ly|BytedanceWebview|TikTok/i],
];

/** 앱을 특정하지 못한 일반 웹뷰 패턴 (Android WebView 표식, 또는 Safari 표식이 없는 iOS 웹뷰) */
const GENERIC_WEBVIEW_PATTERN = /; wv\)|(?:iPhone|iPod|iPad)(?!.*Safari)/i;

/** 일반 브라우저로 판별한 결과 */
const NOT_IN_APP: InAppBrowserInfo = { isInAppBrowser: false, inAppBrowserName: IN_APP_BROWSER_NONE };

/**
 * User-Agent로 인앱 브라우저(SNS·메신저 앱 안의 웹뷰) 여부와 앱 이름을 판별한다.
 * UA 기반 휴리스틱이라 앱 업데이트로 달라질 수 있으며, 분석 세그먼트 용도로만 쓴다.
 * @param userAgent navigator.userAgent 값
 * @returns 인앱 브라우저 여부와 앱 이름
 */
export function detectInAppBrowser(userAgent: string): InAppBrowserInfo {
  for (const [name, pattern] of IN_APP_BROWSER_PATTERNS) {
    if (pattern.test(userAgent)) return { isInAppBrowser: true, inAppBrowserName: name };
  }
  if (GENERIC_WEBVIEW_PATTERN.test(userAgent)) {
    return { isInAppBrowser: true, inAppBrowserName: 'webview' };
  }
  return NOT_IN_APP;
}
