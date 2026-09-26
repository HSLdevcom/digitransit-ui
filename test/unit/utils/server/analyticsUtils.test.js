import {
  buildCrazyEggSurveyScript,
  getAnalyticsInitCode,
} from '../../../../utils/server/analyticsUtils';

const req = { hostname: 'foo', headers: { cookie: {} } };

describe('server analytics utils', () => {
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
      const res = getAnalyticsInitCode(
        { GTMid: 1, crazyEgg: true },
        {
          ...req,
          headers: { cookie: 'lang=fi' },
        },
      );
      expect(res.includes('8cb293bb-6785-481a-81c3-7f4e6f04a536')).toBe(true);
    });
    it('should include Swedish itinerary survey ID when lang=sv', () => {
      const res = getAnalyticsInitCode(
        { GTMid: 1, crazyEgg: true },
        {
          ...req,
          headers: { cookie: 'lang=sv' },
        },
      );
      expect(res.includes('904fe02f-fde8-41b7-933b-ea215cdd5a00')).toBe(true);
    });
    it('should include English itinerary survey ID when lang=en', () => {
      const res = getAnalyticsInitCode(
        { GTMid: 1, crazyEgg: true },
        {
          ...req,
          headers: { cookie: 'lang=en' },
        },
      );
      expect(res.includes('254eb853-fa71-4b3c-8313-9eeca10129b6')).toBe(true);
    });
    it('should not include itinerary survey when language is unknown', () => {
      const res = getAnalyticsInitCode(
        { GTMid: 1, crazyEgg: true },
        {
          ...req,
          headers: { cookie: 'lang=xx' },
        },
      );
      expect(res.includes('8cb293bb-6785-481a-81c3-7f4e6f04a536')).toBe(false);
      expect(res.includes('904fe02f-fde8-41b7-933b-ea215cdd5a00')).toBe(false);
      expect(res.includes('254eb853-fa71-4b3c-8313-9eeca10129b6')).toBe(false);
    });

    it('should include route page survey when lang=fi', () => {
      const res = getAnalyticsInitCode(
        { GTMid: 1, crazyEgg: true },
        {
          ...req,
          headers: { cookie: 'lang=fi' },
        },
      );
      expect(res.includes('96b0b2f3-bc5a-4b40-b910-cc65bb5b6cd9')).toBe(true);
    });
    it('should not include route page survey when lang=sv', () => {
      const res = getAnalyticsInitCode(
        { GTMid: 1, crazyEgg: true },
        {
          ...req,
          headers: { cookie: 'lang=sv' },
        },
      );
      expect(res.includes('96b0b2f3-bc5a-4b40-b910-cc65bb5b6cd9')).toBe(false);
    });
    it('should not include route page survey when lang=en', () => {
      const res = getAnalyticsInitCode(
        { GTMid: 1, crazyEgg: true },
        {
          ...req,
          headers: { cookie: 'lang=en' },
        },
      );
      expect(res.includes('96b0b2f3-bc5a-4b40-b910-cc65bb5b6cd9')).toBe(false);
    });

    it('should include reitti path check in itinerary survey', () => {
      const res = getAnalyticsInitCode(
        { GTMid: 1, crazyEgg: true },
        {
          ...req,
          headers: { cookie: 'lang=fi' },
        },
      );
      expect(res.includes('reitti')).toBe(true);
    });
    it('should include linjat path check in route page survey', () => {
      const res = getAnalyticsInitCode(
        { GTMid: 1, crazyEgg: true },
        {
          ...req,
          headers: { cookie: 'lang=fi' },
        },
      );
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
});
