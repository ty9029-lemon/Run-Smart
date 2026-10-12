import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const amplitudeMock = vi.hoisted(() => {
  /** 설정한 사용자 속성을 props에 모아 두는 Identify 대역 */
  class Identify {
    props: Record<string, unknown> = {};
    set(key: string, value: unknown) {
      this.props[key] = value;
      return this;
    }
  }
  return { init: vi.fn(), track: vi.fn(), identify: vi.fn(), Identify };
});
const mixpanelMock = vi.hoisted(() => ({ init: vi.fn(), track: vi.fn(), register: vi.fn() }));

vi.mock('@amplitude/analytics-browser', () => amplitudeMock);
vi.mock('mixpanel-browser', () => ({ default: mixpanelMock }));
vi.mock('./logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

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

    initAnalytics();

    expect(amplitudeMock.init).not.toHaveBeenCalled();
    expect(mixpanelMock.init).not.toHaveBeenCalled();
  });

  it('두 도구가 모두 준비되면 이벤트를 양쪽으로 보낸다', async () => {
    vi.stubEnv('VITE_AMPLITUDE_API_KEY', 'amp-key');
    vi.stubEnv('VITE_MIXPANEL_TOKEN', 'mp-token');
    const { initAnalytics, trackEvent, ANALYTICS_EVENTS } = await loadAnalytics();

    initAnalytics();
    trackEvent(ANALYTICS_EVENTS.ctaClicked, { cta: 'settings_save' });

    expect(mixpanelMock.init).toHaveBeenCalledWith(
      'mp-token',
      expect.objectContaining({ track_pageview: 'url-with-path' }),
    );
    expect(amplitudeMock.track).toHaveBeenCalledWith('cta_clicked', { cta: 'settings_save' });
    expect(mixpanelMock.track).toHaveBeenCalledWith('cta_clicked', { cta: 'settings_save' });
  });

  it('Mixpanel만 준비되면 Mixpanel로만 보낸다', async () => {
    vi.stubEnv('VITE_AMPLITUDE_API_KEY', '');
    vi.stubEnv('VITE_MIXPANEL_TOKEN', 'mp-token');
    const { initAnalytics, trackEvent, ANALYTICS_EVENTS } = await loadAnalytics();

    initAnalytics();
    trackEvent(ANALYTICS_EVENTS.decisionMade);

    expect(amplitudeMock.track).not.toHaveBeenCalled();
    expect(mixpanelMock.track).toHaveBeenCalledWith('decision_made', undefined);
  });

  it('복장 노출 이벤트 이름이 정의돼 있다', async () => {
    const { ANALYTICS_EVENTS } = await loadAnalytics();

    expect(ANALYTICS_EVENTS.outfitViewed).toBe('outfit_viewed');
  });

  it('유효한 참가자 코드가 URL에 있으면 두 도구에 participantId로 등록한다', async () => {
    vi.stubEnv('VITE_AMPLITUDE_API_KEY', 'amp-key');
    vi.stubEnv('VITE_MIXPANEL_TOKEN', 'mp-token');
    const { initAnalytics } = await loadAnalytics();

    initAnalytics('?pid=P01');

    const identifyArg = amplitudeMock.identify.mock.calls[0][0];
    expect(identifyArg.props).toEqual({ participantId: 'P01' });
    expect(mixpanelMock.register).toHaveBeenCalledWith({ participantId: 'P01' });
  });

  it('같은 참가자 코드로 다시 초기화해도 한 번만 등록한다', async () => {
    vi.stubEnv('VITE_AMPLITUDE_API_KEY', 'amp-key');
    vi.stubEnv('VITE_MIXPANEL_TOKEN', 'mp-token');
    const { initAnalytics } = await loadAnalytics();

    initAnalytics('?pid=P01');
    initAnalytics('?pid=P01');

    expect(amplitudeMock.identify).toHaveBeenCalledTimes(1);
    expect(mixpanelMock.register).toHaveBeenCalledTimes(1);
  });

  it('참가자 코드가 없거나 형식이 틀리면 등록하지 않는다', async () => {
    vi.stubEnv('VITE_AMPLITUDE_API_KEY', 'amp-key');
    vi.stubEnv('VITE_MIXPANEL_TOKEN', 'mp-token');
    const { initAnalytics } = await loadAnalytics();

    initAnalytics('');
    initAnalytics('?pid=a@b.com');

    expect(amplitudeMock.identify).not.toHaveBeenCalled();
    expect(mixpanelMock.register).not.toHaveBeenCalled();
  });

  it('초기화된 도구에만 참가자 코드를 등록한다', async () => {
    vi.stubEnv('VITE_AMPLITUDE_API_KEY', '');
    vi.stubEnv('VITE_MIXPANEL_TOKEN', 'mp-token');
    const { initAnalytics } = await loadAnalytics();

    initAnalytics('?pid=P02');

    expect(amplitudeMock.identify).not.toHaveBeenCalled();
    expect(mixpanelMock.register).toHaveBeenCalledWith({ participantId: 'P02' });
  });

  it('초기화 전에는 이벤트를 보내지 않는다', async () => {
    const { trackEvent, ANALYTICS_EVENTS } = await loadAnalytics();

    trackEvent(ANALYTICS_EVENTS.decisionMade);

    expect(amplitudeMock.track).not.toHaveBeenCalled();
    expect(mixpanelMock.track).not.toHaveBeenCalled();
  });
});
