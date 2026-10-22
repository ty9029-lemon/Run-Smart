import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const amplitudeMock = vi.hoisted(() => {
  /** 설정한 사용자 속성을 props에 모아 두는 Identify 대역 */
  class Identify {
    props: Record<string, unknown> = {};
    onceProps: Record<string, unknown> = {};
    set(key: string, value: unknown) {
      this.props[key] = value;
      return this;
    }
    setOnce(key: string, value: unknown) {
      this.onceProps[key] = value;
      return this;
    }
  }
  return { init: vi.fn(), track: vi.fn(), identify: vi.fn(), Identify };
});
const mixpanelMock = vi.hoisted(() => {
  const mock = {
    init: vi.fn(),
    track: vi.fn(),
    register: vi.fn(),
    register_once: vi.fn(),
    track_pageview: vi.fn(),
  };
  // 실제 SDK처럼 초기화가 끝나면 loaded 콜백을 호출한다
  mock.init.mockImplementation(
    (_token: string, config?: { loaded?: (instance: typeof mock) => void }) =>
      config?.loaded?.(mock),
  );
  return mock;
});

vi.mock('@amplitude/analytics-browser', () => amplitudeMock);
vi.mock('mixpanel-browser', () => ({ default: mixpanelMock }));
vi.mock('./logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

const PRODUCTION_HOST = 'runners-fit.vercel.app';
const APP_VERSION = '1.1';

const SAFARI_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const INSTAGRAM_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21A329 Instagram 300.0.0.29.110';

/** 모듈 내부 초기화 플래그를 초기화하기 위해 매번 새로 불러온다. */
async function loadAnalytics() {
  vi.resetModules();
  return import('./analytics');
}

describe('analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('토큰이 없으면 해당 도구 초기화를 건너뛴다', async () => {
    vi.stubEnv('VITE_AMPLITUDE_API_KEY', '');
    vi.stubEnv('VITE_MIXPANEL_TOKEN', '');
    const { initAnalytics } = await loadAnalytics();

    initAnalytics('', '', PRODUCTION_HOST);

    expect(amplitudeMock.init).not.toHaveBeenCalled();
    expect(mixpanelMock.init).not.toHaveBeenCalled();
  });

  it('두 도구가 모두 준비되면 이벤트를 양쪽으로 보낸다', async () => {
    vi.stubEnv('VITE_AMPLITUDE_API_KEY', 'amp-key');
    vi.stubEnv('VITE_MIXPANEL_TOKEN', 'mp-token');
    const { initAnalytics, trackEvent, ANALYTICS_EVENTS } = await loadAnalytics();

    initAnalytics('', '', PRODUCTION_HOST);
    trackEvent(ANALYTICS_EVENTS.ctaClicked, { cta: 'settings_save' });

    expect(mixpanelMock.init).toHaveBeenCalledWith(
      'mp-token',
      expect.objectContaining({ persistence: 'localStorage' }),
    );
    expect(amplitudeMock.track).toHaveBeenCalledWith('cta_clicked', { cta: 'settings_save' });
    expect(mixpanelMock.track).toHaveBeenCalledWith('cta_clicked', { cta: 'settings_save' });
  });

  it('Mixpanel만 준비되면 Mixpanel로만 보낸다', async () => {
    vi.stubEnv('VITE_AMPLITUDE_API_KEY', '');
    vi.stubEnv('VITE_MIXPANEL_TOKEN', 'mp-token');
    const { initAnalytics, trackEvent, ANALYTICS_EVENTS } = await loadAnalytics();

    initAnalytics('', '', PRODUCTION_HOST);
    trackEvent(ANALYTICS_EVENTS.decisionMade);

    expect(amplitudeMock.track).not.toHaveBeenCalled();
    expect(mixpanelMock.track).toHaveBeenCalledWith('decision_made', undefined);
  });

  it('복장 노출 이벤트 이름이 정의돼 있다', async () => {
    const { ANALYTICS_EVENTS } = await loadAnalytics();

    expect(ANALYTICS_EVENTS.outfitViewed).toBe('outfit_viewed');
  });

  it('참가자 코드와 인앱 브라우저 여부를 두 도구에 사용자 속성으로 등록한다', async () => {
    vi.stubEnv('VITE_AMPLITUDE_API_KEY', 'amp-key');
    vi.stubEnv('VITE_MIXPANEL_TOKEN', 'mp-token');
    const { initAnalytics } = await loadAnalytics();
    const expected = {
      participantId: 'P01',
      hostname: PRODUCTION_HOST,
      appVersion: APP_VERSION,
      isInAppBrowser: false,
      inAppBrowserName: 'none',
    };

    initAnalytics('?pid=P01', SAFARI_UA, PRODUCTION_HOST);

    expect(amplitudeMock.identify.mock.calls[0][0].props).toEqual(expected);
    expect(mixpanelMock.register).toHaveBeenCalledWith(expected);
  });

  it('인앱 브라우저로 열리면 앱 이름과 함께 등록한다', async () => {
    vi.stubEnv('VITE_AMPLITUDE_API_KEY', 'amp-key');
    vi.stubEnv('VITE_MIXPANEL_TOKEN', 'mp-token');
    const { initAnalytics } = await loadAnalytics();
    const expected = {
      hostname: PRODUCTION_HOST,
      appVersion: APP_VERSION,
      isInAppBrowser: true,
      inAppBrowserName: 'instagram',
    };

    initAnalytics('', INSTAGRAM_UA, PRODUCTION_HOST);

    expect(amplitudeMock.identify.mock.calls[0][0].props).toEqual(expected);
    expect(mixpanelMock.register).toHaveBeenCalledWith(expected);
  });

  it('참가자 코드가 없거나 형식이 틀리면 코드 없이 인앱 속성만 등록한다', async () => {
    vi.stubEnv('VITE_AMPLITUDE_API_KEY', 'amp-key');
    vi.stubEnv('VITE_MIXPANEL_TOKEN', 'mp-token');
    const { initAnalytics } = await loadAnalytics();

    initAnalytics('?pid=a@b.com', SAFARI_UA, PRODUCTION_HOST);

    expect(amplitudeMock.identify.mock.calls[0][0].props).toEqual({
      hostname: PRODUCTION_HOST,
      appVersion: APP_VERSION,
      isInAppBrowser: false,
      inAppBrowserName: 'none',
    });
    expect(mixpanelMock.register.mock.calls[0][0]).not.toHaveProperty('participantId');
  });

  it('유입 채널(utm)을 첫 접속 속성으로 두 도구에 등록한다', async () => {
    vi.stubEnv('VITE_AMPLITUDE_API_KEY', 'amp-key');
    vi.stubEnv('VITE_MIXPANEL_TOKEN', 'mp-token');
    const { initAnalytics } = await loadAnalytics();
    const expected = { utmSource: 'x', utmCampaign: 'ut1' };

    initAnalytics('?utm_source=x&utm_campaign=ut1', SAFARI_UA, PRODUCTION_HOST);

    expect(amplitudeMock.identify.mock.calls[0][0].onceProps).toEqual(expected);
    expect(mixpanelMock.register_once).toHaveBeenCalledWith(expected);
  });

  it('utm이 없으면 첫 접속 속성은 빈 값으로 등록한다', async () => {
    vi.stubEnv('VITE_AMPLITUDE_API_KEY', 'amp-key');
    vi.stubEnv('VITE_MIXPANEL_TOKEN', 'mp-token');
    const { initAnalytics } = await loadAnalytics();

    initAnalytics('', SAFARI_UA, PRODUCTION_HOST);

    expect(amplitudeMock.identify.mock.calls[0][0].onceProps).toEqual({});
    expect(mixpanelMock.register_once).toHaveBeenCalledWith({});
  });

  it('접속 호스트를 hostname 속성으로 두 도구에 등록한다', async () => {
    vi.stubEnv('VITE_AMPLITUDE_API_KEY', 'amp-key');
    vi.stubEnv('VITE_MIXPANEL_TOKEN', 'mp-token');
    const { initAnalytics } = await loadAnalytics();
    const expected = {
      hostname: PRODUCTION_HOST,
      appVersion: APP_VERSION,
      isInAppBrowser: false,
      inAppBrowserName: 'none',
    };

    initAnalytics('', SAFARI_UA, PRODUCTION_HOST);

    expect(amplitudeMock.identify.mock.calls[0][0].props).toEqual(expected);
    expect(mixpanelMock.register).toHaveBeenCalledWith(expected);
  });

  it.each(['localhost', 'runners-fit-git-feat-x.vercel.app', ''])(
    '운영 호스트가 아니면(%j) 두 도구를 초기화하지 않는다',
    async (hostname) => {
      vi.stubEnv('VITE_AMPLITUDE_API_KEY', 'amp-key');
      vi.stubEnv('VITE_MIXPANEL_TOKEN', 'mp-token');
      const { initAnalytics, trackEvent, ANALYTICS_EVENTS } = await loadAnalytics();

      initAnalytics('?pid=P01', SAFARI_UA, hostname);
      trackEvent(ANALYTICS_EVENTS.ctaClicked, { cta: 'settings_save' });

      expect(amplitudeMock.init).not.toHaveBeenCalled();
      expect(mixpanelMock.init).not.toHaveBeenCalled();
      expect(amplitudeMock.track).not.toHaveBeenCalled();
      expect(mixpanelMock.track).not.toHaveBeenCalled();
    },
  );

  it('같은 속성으로 다시 초기화해도 한 번만 등록한다', async () => {
    vi.stubEnv('VITE_AMPLITUDE_API_KEY', 'amp-key');
    vi.stubEnv('VITE_MIXPANEL_TOKEN', 'mp-token');
    const { initAnalytics } = await loadAnalytics();

    initAnalytics('?pid=P01', SAFARI_UA, PRODUCTION_HOST);
    initAnalytics('?pid=P01', SAFARI_UA, PRODUCTION_HOST);

    expect(amplitudeMock.identify).toHaveBeenCalledTimes(1);
    expect(mixpanelMock.register).toHaveBeenCalledTimes(1);
  });

  it('초기화된 도구에만 속성을 등록한다', async () => {
    vi.stubEnv('VITE_AMPLITUDE_API_KEY', '');
    vi.stubEnv('VITE_MIXPANEL_TOKEN', 'mp-token');
    const { initAnalytics } = await loadAnalytics();

    initAnalytics('?pid=P02', SAFARI_UA, PRODUCTION_HOST);

    expect(amplitudeMock.identify).not.toHaveBeenCalled();
    expect(mixpanelMock.register).toHaveBeenCalledWith({
      participantId: 'P02',
      hostname: PRODUCTION_HOST,
      appVersion: APP_VERSION,
      isInAppBrowser: false,
      inAppBrowserName: 'none',
    });
  });

  it('Mixpanel 자동 페이지뷰는 끄고, 준비된 뒤에 직접 기록한다', async () => {
    vi.stubEnv('VITE_AMPLITUDE_API_KEY', '');
    vi.stubEnv('VITE_MIXPANEL_TOKEN', 'mp-token');
    const { initAnalytics, trackPageView } = await loadAnalytics();

    initAnalytics('', SAFARI_UA, PRODUCTION_HOST);
    trackPageView();

    expect(mixpanelMock.init).toHaveBeenCalledWith(
      'mp-token',
      expect.objectContaining({ track_pageview: false }),
    );
    expect(mixpanelMock.track_pageview).toHaveBeenCalledTimes(1);
  });

  it('Mixpanel이 준비되지 않았으면 페이지뷰를 기록하지 않는다', async () => {
    const { trackPageView } = await loadAnalytics();

    trackPageView();

    expect(mixpanelMock.track_pageview).not.toHaveBeenCalled();
  });

  it('초기화 전에는 이벤트를 보내지 않는다', async () => {
    const { trackEvent, ANALYTICS_EVENTS } = await loadAnalytics();

    trackEvent(ANALYTICS_EVENTS.decisionMade);

    expect(amplitudeMock.track).not.toHaveBeenCalled();
    expect(mixpanelMock.track).not.toHaveBeenCalled();
  });
});
