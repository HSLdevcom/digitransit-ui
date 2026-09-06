import {
  addAnalyticsEvent,
  buildCrazyEggSurveyScript,
  getAnalyticsInitCode,
  initAnalyticsClientSide,
  handleUserAnalytics,
} from '../../../app/util/analyticsUtils';

afterEach(() => {
  window.dataLayer = undefined;
});

const req = { hostname: 'foo', headers: { cookie: {} } };
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
  describe('getAnalyticsInitCode', () => {
    it('should return a nonempty string when GTMid is given', () => {
      const res = getAnalyticsInitCode({ GTMid: 1 }, req);
      expect(res.length > 0).toBe(true);
    });
    it('should return an empty string when null GTMid and no analyticsScript is given', () => {
      const res = getAnalyticsInitCode(
        { GTMid: null, analyticsScript: '' },
        req,
      );
      expect(res.length).toBe(0);
    });
    it('should return a nonempty string when analyticsScript and hostname are given', () => {
      const res = getAnalyticsInitCode({ analyticsScript: () => 'test' }, req);
      expect(res.length > 0).toBe(true);
    });
    it('should have GTMId in the returned string when GTMid is given', () => {
      const res = getAnalyticsInitCode({ GTMid: 'this-is-test' }, req);
      expect(res.includes('this-is-test')).toBe(true);
    });
    it('should return a nonempty string when cookieConsent is true', () => {
      const res = getAnalyticsInitCode(
        { GTMid: null, analyticsScript: () => 'test' },
        { ...req, headers: { cookie: 'cookieConsent=true' } },
      );
      expect(res.length > 0).toBe(true);
    });

    it('should return an empty string when hostname matches dev and devAnalytics is false', () => {
      const res = getAnalyticsInitCode(
        {
          analyticsScript: () => 'test',
          devAnalytics: false,
        },
        { ...req, hostname: 'dev' },
      );
      expect(res.length).toBe(0);
    });
    it('should return an empty string when hostname matches test and devAnalytics is false, when GTMid is not present', () => {
      const res = getAnalyticsInitCode(
        {
          analyticsScript: () => 'test',
          devAnalytics: false,
        },
        { ...req, hostname: 'test' },
      );
      expect(res.length).toBe(0);
    });
    it('should return a nonempty string when devAnalytics is true', () => {
      const res = getAnalyticsInitCode(
        {
          analyticsScript: () => 'test',
          devAnalytics: true,
        },
        { ...req, hostname: 'foobar' },
      );
      expect(res).toBe('test');
    });
    it('should return a nonempty string when useCookiesPrompt is false and cookieConsent is false, but GTMid is present', () => {
      const res = getAnalyticsInitCode(
        { GTMid: 1, useCookiesPrompt: false },
        { ...req, headers: { cookie: 'cookieConsent=false' } },
      );
      expect(res.length > 0).toBe(true);
    });
    it('should return a empty string when useCookiesPrompt is false and cookieConsent is false, but GTMid is not present', () => {
      const res = getAnalyticsInitCode(
        { GTMid: null, useCookiesPrompt: false },
        { ...req, headers: { cookie: 'cookieConsent=false' } },
      );
      expect(res.length).toBe(0);
    });
    it('should return a nonempty string when useCookiesPrompt is false and cookieConsent is true', () => {
      const res = getAnalyticsInitCode(
        { GTMid: 1, useCookiesPrompt: false },
        { ...req, headers: { cookie: 'cookieConsent=true' } },
      );
      expect(res.length > 0).toBe(true);
    });
    it('should return crazyEgg configuration string when crazyEgg is true', () => {
      const res = getAnalyticsInitCode(
        { GTMid: 1, crazyEgg: true },
        { ...req, headers: { cookie: 'cookieConsent=true' } },
      );
      expect(
        res.includes(
          '<script type="text/javascript" src="//script.crazyegg.com/pages/scripts/0030/3436.js" async="async" ></script>',
        ),
      ).toBe(true);
    });

    it('should include Finnish itinerary survey ID when lang=fi', () => {
      document.cookie = 'lang=fi';
      const res = getAnalyticsInitCode({ GTMid: 1, crazyEgg: true }, req);
      document.cookie = 'lang=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      expect(res.includes('8cb293bb-6785-481a-81c3-7f4e6f04a536')).toBe(true);
    });
    it('should include Swedish itinerary survey ID when lang=sv', () => {
      document.cookie = 'lang=sv';
      const res = getAnalyticsInitCode({ GTMid: 1, crazyEgg: true }, req);
      document.cookie = 'lang=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      expect(res.includes('904fe02f-fde8-41b7-933b-ea215cdd5a00')).toBe(true);
    });
    it('should include English itinerary survey ID when lang=en', () => {
      document.cookie = 'lang=en';
      const res = getAnalyticsInitCode({ GTMid: 1, crazyEgg: true }, req);
      document.cookie = 'lang=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      expect(res.includes('254eb853-fa71-4b3c-8313-9eeca10129b6')).toBe(true);
    });
    it('should not include itinerary survey when language is unknown', () => {
      document.cookie = 'lang=xx';
      const res = getAnalyticsInitCode({ GTMid: 1, crazyEgg: true }, req);
      document.cookie = 'lang=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      expect(res.includes('8cb293bb-6785-481a-81c3-7f4e6f04a536')).toBe(false);
      expect(res.includes('904fe02f-fde8-41b7-933b-ea215cdd5a00')).toBe(false);
      expect(res.includes('254eb853-fa71-4b3c-8313-9eeca10129b6')).toBe(false);
    });

    it('should include route page survey when lang=fi', () => {
      document.cookie = 'lang=fi';
      const res = getAnalyticsInitCode({ GTMid: 1, crazyEgg: true }, req);
      document.cookie = 'lang=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      expect(res.includes('96b0b2f3-bc5a-4b40-b910-cc65bb5b6cd9')).toBe(true);
    });
    it('should not include route page survey when lang=sv', () => {
      document.cookie = 'lang=sv';
      const res = getAnalyticsInitCode({ GTMid: 1, crazyEgg: true }, req);
      document.cookie = 'lang=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      expect(res.includes('96b0b2f3-bc5a-4b40-b910-cc65bb5b6cd9')).toBe(false);
    });
    it('should not include route page survey when lang=en', () => {
      document.cookie = 'lang=en';
      const res = getAnalyticsInitCode({ GTMid: 1, crazyEgg: true }, req);
      document.cookie = 'lang=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      expect(res.includes('96b0b2f3-bc5a-4b40-b910-cc65bb5b6cd9')).toBe(false);
    });

    it('should include reitti path check in itinerary survey', () => {
      document.cookie = 'lang=fi';
      const res = getAnalyticsInitCode({ GTMid: 1, crazyEgg: true }, req);
      document.cookie = 'lang=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      expect(res.includes('reitti')).toBe(true);
    });
    it('should include linjat path check in route page survey', () => {
      document.cookie = 'lang=fi';
      const res = getAnalyticsInitCode({ GTMid: 1, crazyEgg: true }, req);
      document.cookie = 'lang=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      expect(res.includes('linjat')).toBe(true);
    });
  });

  describe('buildCrazyEggSurveyScript', () => {
    const surveyIds = {
      fi: 'fi-survey-id',
      en: 'en-survey-id',
    };
    it('returns empty string when language is undefined', () => {
      const result = buildCrazyEggSurveyScript(surveyIds, {});
      expect(result).toBe('');
    });
    it('returns empty string when language is not in surveyIds', () => {
      const result = buildCrazyEggSurveyScript(surveyIds, { language: 'sv' });
      expect(result).toBe('');
    });
    it('returns a non-empty script string for a matching language', () => {
      const result = buildCrazyEggSurveyScript(surveyIds, { language: 'fi' });
      expect(result.length > 0).toBe(true);
    });
    it('includes the correct survey ID for the matched language', () => {
      const result = buildCrazyEggSurveyScript(surveyIds, { language: 'en' });
      expect(result.includes('en-survey-id')).toBe(true);
      expect(result.includes('fi-survey-id')).toBe(false);
    });
    it('includes pathname check when pathPrefix is given', () => {
      const result = buildCrazyEggSurveyScript(surveyIds, {
        language: 'fi',
        pathPrefix: 'test-path',
      });
      expect(
        result.includes('window.location.pathname.includes("test-path")'),
      ).toBe(true);
    });
    it('does not include pathname check when pathPrefix is omitted', () => {
      const result = buildCrazyEggSurveyScript(surveyIds, { language: 'fi' });
      expect(result.includes('window.location.pathname')).toBe(false);
    });
    it('includes modulo sampling check when surveyShare is given', () => {
      const result = buildCrazyEggSurveyScript(surveyIds, {
        language: 'fi',
        surveyShare: 100,
      });
      expect(result.includes('%100')).toBe(true);
    });
    it('includes setTimeout with correct delay when delay is given', () => {
      const result = buildCrazyEggSurveyScript(surveyIds, {
        language: 'fi',
        delay: 5000,
      });
      expect(result.includes('setTimeout')).toBe(true);
      expect(result.includes('5000')).toBe(true);
    });
    it('includes mobile overlay guards when mobileChecks is true', () => {
      const result = buildCrazyEggSurveyScript(surveyIds, {
        language: 'fi',
        mobileChecks: true,
      });
      expect(result.includes('offcanvas-mobile')).toBe(true);
      expect(result.includes('digitransit-mobile-datetime')).toBe(true);
    });
    it('does not include mobile guards when mobileChecks is not set', () => {
      const result = buildCrazyEggSurveyScript(surveyIds, { language: 'fi' });
      expect(result.includes('offcanvas-mobile')).toBe(false);
    });
  });

  describe('initAnalyticsClientSide', () => {
    const initCookies = consent => ({
      get: vi.fn().mockReturnValue(consent),
      set: vi.fn(),
      remove: vi.fn(),
      addChangeListener: vi.fn(),
      removeChangeListener: vi.fn(),
    });
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
      expect(window.dataLayer).toBe(undefined);
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
