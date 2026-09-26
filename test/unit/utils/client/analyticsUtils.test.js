import Cookies from 'universal-cookie';

import {
  addAnalyticsEvent,
  initAnalyticsClientSide,
  handleUserAnalytics,
} from '../../../../utils/client/analyticsUtils';

afterEach(() => {
  window.dataLayer = undefined;
});

describe('analytics utils', () => {
  describe('addAnalyticsEvent', () => {
    it('should add a new entry to window.dataLayer', () => {
      window.dataLayer = [];
      addAnalyticsEvent({ foo: 'bar' });
      const newSize = window.dataLayer.length;
      expect(newSize).toBe(1);
    });

    it('should add correct event value when it is missing', () => {
      window.dataLayer = [];
      addAnalyticsEvent({ foo: 'bar' });
      const entry = window.dataLayer[0];
      expect(entry.event).toBe('sendMatomoEvent');
    });

    it('should not replace existing event value', () => {
      window.dataLayer = [];
      addAnalyticsEvent({ event: 'testEvent' });
      const entry = window.dataLayer[0];
      expect(entry.event).toBe('testEvent');
    });
  });
  describe('initAnalyticsClientSide', () => {
    const initCookies = consent => {
      const cookies = new Cookies();
      vi.spyOn(cookies, 'get').mockReturnValue(consent);
      return cookies;
    };
    it('should initialize window.dataLayer to an array', () => {
      window.dataLayer = undefined;
      initAnalyticsClientSide({});
      expect(Array.isArray(window.dataLayer)).toBe(true);
    });
    it('should initialize window.dataLayer to an array with cookies', () => {
      window.dataLayer = undefined;
      const cookies = initCookies(true);
      initAnalyticsClientSide({ GTMid: 1, useCookiesPrompt: true }, cookies);
      expect(Array.isArray(window.dataLayer)).toBe(true);
    });
    it('should initialize window.dataLayer to undefined when cookies are not accepted', () => {
      window.dataLayer = undefined;
      const cookies = initCookies(false);
      initAnalyticsClientSide({ GTMid: 1, useCookiesPrompt: true }, cookies);
      expect(window.dataLayer).toBeUndefined();
    });
    it('should initialize window.dataLayer to an empty array when useCookiesPrompt is false, cookies are accepted', () => {
      window.dataLayer = undefined;
      const cookies = initCookies(true);
      initAnalyticsClientSide({ GTMid: 1, useCookiesPrompt: false }, cookies);
      expect(Array.isArray(window.dataLayer)).toBe(true);
    });
    it('should initialize window.dataLayer to an empty array when useCookiesPrompt is false, cookies are not accepted', () => {
      window.dataLayer = undefined;
      const cookies = initCookies(false);
      initAnalyticsClientSide({ GTMid: 1, useCookiesPrompt: false }, cookies);
      expect(Array.isArray(window.dataLayer)).toBe(true);
    });
    it('should initialize window.dataLayer to an array without cookies', () => {
      window.dataLayer = undefined;
      initAnalyticsClientSide({ useCookiesPrompt: false, GTMid: 1 });
      expect(Array.isArray(window.dataLayer)).toBe(true);
    });
  });
});

describe('handleUserAnalytics', () => {
  const config = {
    loginAnalyticsEventName: 'testLoginEvent',
    user: { sub: '123456' },
  };
  it('should call addAnaxlyticsEvent when user is defined', () => {
    window.dataLayer = [];
    handleUserAnalytics(config);
    expect(window.dataLayer.length).toBe(1);
    expect(window.dataLayer[0].event).toBe('testLoginEvent');
  });
  it('should not call addAnalyticsEvent when user is undefined', () => {
    window.dataLayer = [];
    config.user = {};
    handleUserAnalytics(config);
    expect(window.dataLayer.length).toBe(0);
  });
});
