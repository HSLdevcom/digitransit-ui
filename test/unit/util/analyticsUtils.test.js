import Sinon from 'sinon';
import Cookies from 'universal-cookie';

import {
  addAnalyticsEvent,
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
      expect(newSize).to.equal(1);
    });

    it('should add correct event value when it is missing', () => {
      window.dataLayer = [];
      addAnalyticsEvent({ foo: 'bar' });
      const entry = window.dataLayer[0];
      expect(entry.event).to.equal('sendMatomoEvent');
    });

    it('should not replace existing event value', () => {
      window.dataLayer = [];
      addAnalyticsEvent({ event: 'testEvent' });
      const entry = window.dataLayer[0];
      expect(entry.event).to.equal('testEvent');
    });
  });
  describe('getAnalyticsInitCode', () => {
    it('should return a nonempty string when GTMid is given', () => {
      const res = getAnalyticsInitCode({ GTMid: 1 }, req);
      expect(res.length > 0).to.equal(true);
    });
    it('should return an empty string when null GTMid and no analyticsScript is given', () => {
      const res = getAnalyticsInitCode(
        { GTMid: null, analyticsScript: '' },
        req,
      );
      expect(res.length).to.equal(0);
    });
    it('should return a nonempty string when analyticsScript and hostname are given', () => {
      const res = getAnalyticsInitCode({ analyticsScript: () => 'test' }, req);
      expect(res.length > 0).to.equal(true);
    });
    it('should have GTMId in the returned string when GTMid is given', () => {
      const res = getAnalyticsInitCode({ GTMid: 'this-is-test' }, req);
      expect(res.includes('this-is-test')).to.equal(true);
    });
    it('should return a nonempty string when cookieConsent is true', () => {
      const res = getAnalyticsInitCode(
        { GTMid: null, analyticsScript: () => 'test' },
        { ...req, headers: { cookie: 'cookieConsent=true' } },
      );
      expect(res.length > 0).to.equal(true);
    });

    it('should return an empty string when hostname matches dev and devAnalytics is false', () => {
      const res = getAnalyticsInitCode(
        {
          analyticsScript: () => 'test',
          devAnalytics: false,
        },
        { ...req, hostname: 'dev' },
      );
      expect(res.length).to.equal(0);
    });
    it('should return an empty string when hostname matches test and devAnalytics is false, when GTMid is not present', () => {
      const res = getAnalyticsInitCode(
        {
          analyticsScript: () => 'test',
          devAnalytics: false,
        },
        { ...req, hostname: 'test' },
      );
      expect(res.length).to.equal(0);
    });
    it('should return a nonempty string when devAnalytics is true', () => {
      const res = getAnalyticsInitCode(
        {
          analyticsScript: () => 'test',
          devAnalytics: true,
        },
        { ...req, hostname: 'foobar' },
      );
      expect(res).to.equal('test');
    });
    it('should return a nonempty string when useCookiesPrompt is false and cookieConsent is false, but GTMid is present', () => {
      const res = getAnalyticsInitCode(
        { GTMid: 1, useCookiesPrompt: false },
        { ...req, headers: { cookie: 'cookieConsent=false' } },
      );
      expect(res.length > 0).to.equal(true);
    });
    it('should return a empty string when useCookiesPrompt is false and cookieConsent is false, but GTMid is not present', () => {
      const res = getAnalyticsInitCode(
        { GTMid: null, useCookiesPrompt: false },
        { ...req, headers: { cookie: 'cookieConsent=false' } },
      );
      expect(res.length).to.equal(0);
    });
    it('should return a nonempty string when useCookiesPrompt is false and cookieConsent is true', () => {
      const res = getAnalyticsInitCode(
        { GTMid: 1, useCookiesPrompt: false },
        { ...req, headers: { cookie: 'cookieConsent=true' } },
      );
      expect(res.length > 0).to.equal(true);
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
      ).to.equal(true);
    });
  });
  describe('initAnalyticsClientSide', () => {
    const initCookies = consent => {
      const cookies = Sinon.stub(new Cookies());
      cookies.get.returns(consent);
      return cookies;
    };
    it('should initialize window.dataLayer to an array', () => {
      window.dataLayer = undefined;
      initAnalyticsClientSide({});
      expect(Array.isArray(window.dataLayer)).to.equal(true);
    });
    it('should initialize window.dataLayer to an array with cookies', () => {
      window.dataLayer = undefined;
      const cookies = initCookies(true);
      initAnalyticsClientSide({ GTMid: 1, useCookiesPrompt: true }, cookies);
      expect(Array.isArray(window.dataLayer)).to.equal(true);
    });
    it('should initialize window.dataLayer to undefined when cookies are not accepted', () => {
      window.dataLayer = undefined;
      const cookies = initCookies(false);
      initAnalyticsClientSide({ GTMid: 1, useCookiesPrompt: true }, cookies);
      expect(window.dataLayer).to.equal(undefined);
    });
    it('should initialize window.dataLayer to an empty array when useCookiesPrompt is false, cookies are accepted', () => {
      window.dataLayer = undefined;
      const cookies = initCookies(true);
      initAnalyticsClientSide({ GTMid: 1, useCookiesPrompt: false }, cookies);
      expect(Array.isArray(window.dataLayer)).to.equal(true);
    });
    it('should initialize window.dataLayer to an empty array when useCookiesPrompt is false, cookies are not accepted', () => {
      window.dataLayer = undefined;
      const cookies = initCookies(false);
      initAnalyticsClientSide({ GTMid: 1, useCookiesPrompt: false }, cookies);
      expect(Array.isArray(window.dataLayer)).to.equal(true);
    });
    it('should initialize window.dataLayer to an array without cookies', () => {
      window.dataLayer = undefined;
      initAnalyticsClientSide({ useCookiesPrompt: false, GTMid: 1 });
      expect(Array.isArray(window.dataLayer)).to.equal(true);
    });
  });
});

describe('handleUserAnalytics', () => {
  const config = {
    loginAnalyticsEventName: 'testLoginEvent',
  };
  const user = {
    sub: '123456',
  };
  it('should call addAnalyticsEvent when user is defined', () => {
    window.dataLayer = [];
    handleUserAnalytics(user, config);
    expect(window.dataLayer.length).to.equal(1);
    expect(window.dataLayer[0].event).to.equal('testLoginEvent');
  });
  it('should not call addAnalyticsEvent when user is undefined', () => {
    window.dataLayer = [];
    handleUserAnalytics(undefined, config);
    expect(window.dataLayer.length).to.equal(0);
  });
});
