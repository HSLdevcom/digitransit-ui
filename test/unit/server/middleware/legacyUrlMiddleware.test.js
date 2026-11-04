import {
  validateParams,
  dropPathLanguage,
} from '../../../../server/middleware/legacyUrlMiddleware';

import config from '../../../../server/configs/config.default';
import {
  LEGACY_LOCALES,
  LEGACY_LOCALE_PATHS,
} from '../../../../utils/shared/constants';
import { PREFIX_ITINERARY_SUMMARY } from '../../../../utils/shared/path';

describe('legacyUrlMiddleware', () => {
  describe('validateParams', () => {
    const req = {
      path: `/${PREFIX_ITINERARY_SUMMARY}`,
      query: {
        minTransferTime: '60',
        modes: 'BUS,TRAM,RAIL,SUBWAY,FERRY,WALK,CITYBIKE',
        transferPenalty: '0',
        walkBoardCost: '540',
        walkReluctance: '1.5',
        walkSpeed: '1.5',
      },
    };

    it('should not modify valid url', () => {
      const url = validateParams(req, config);
      expect(url).toBeUndefined();
    });

    it('should remove invalid time parameter', () => {
      req.query.time = 'test';
      const url = validateParams(req, config);
      expect(url).toBe(
        `/${PREFIX_ITINERARY_SUMMARY}?minTransferTime=60&modes=BUS,TRAM,RAIL,SUBWAY,FERRY,WALK,CITYBIKE&transferPenalty=0&walkBoardCost=540&walkReluctance=1.5&walkSpeed=1.5`,
      );
    });

    it('should remove a too old time parameter', () => {
      const oldReq = { path: '/x', query: { time: '1', a: 'b' } };
      const url = validateParams(oldReq, { queryMaxAgeDays: 14 });
      expect(url).toBe('/x?a=b');
    });

    it('should not leave a trailing "?" when removing the only query parameter', () => {
      const emptyReq = {
        path: `/${PREFIX_ITINERARY_SUMMARY}`,
        query: { time: 'test' },
      };
      const url = validateParams(emptyReq, config);
      expect(url).toBe(`/${PREFIX_ITINERARY_SUMMARY}`);
    });
  });

  describe('dropPathLanguage', () => {
    const req = {
      path: '/en/',
      query: {},
    };

    it('should return the root path', () => {
      const relativeUrl = dropPathLanguage(req, 'en');
      expect(relativeUrl).toBe('/');
    });

    it('should return path without language', () => {
      req.path = `/sv/${PREFIX_ITINERARY_SUMMARY}/Rautatientori%2C%20Helsinki%3A%3A60.171283%2C24.942572/Pasila%2C%20Helsinki%3A%3A60.199017%2C24.933973`;
      const relativeUrl = dropPathLanguage(req, 'sv');
      expect(relativeUrl).toBe(
        `/${PREFIX_ITINERARY_SUMMARY}/Rautatientori%2C%20Helsinki%3A%3A60.171283%2C24.942572/Pasila%2C%20Helsinki%3A%3A60.199017%2C24.933973`,
      );
    });

    it('should not ignore URL parameters', () => {
      req.path = `/en/${PREFIX_ITINERARY_SUMMARY}/Otaniemi,%20Espoo::60.187938,24.83182/Rautatientori,%20Asemanaukio%202,%20Helsinki::60.170384,24.939846`;
      req.query = {
        time: 1565074800,
        arriveBy: false,
      };

      const relativeUrl = dropPathLanguage(req, 'en');
      expect(relativeUrl).toBe(
        `/${PREFIX_ITINERARY_SUMMARY}/Otaniemi,%20Espoo::60.187938,24.83182/Rautatientori,%20Asemanaukio%202,%20Helsinki::60.170384,24.939846?time=1565074800&arriveBy=false`,
      );
    });

    it('should drop the special "slangi" pseudo-locale', () => {
      req.path = '/slangi/';
      req.query = {};
      const relativeUrl = dropPathLanguage(req, 'slangi');
      expect(relativeUrl).toBe('/');
    });
  });

  describe('protocol-relative paths', () => {
    it('never produces a redirect starting with "//"', () => {
      const bad = { path: '//example.com/x', query: { time: 'abc' } };
      expect(validateParams(bad, config)).toBe('/example.com/x');
      expect(
        dropPathLanguage({ path: '/en//example.com', query: {} }, 'en'),
      ).toBe('/example.com');
      expect(
        dropPathLanguage({ path: '/en/\\example.com', query: {} }, 'en'),
      ).toBe('/example.com');
    });

    it('only drops the language when it is a whole path segment', () => {
      expect(dropPathLanguage({ path: '/english/x', query: {} }, 'en')).toBe(
        '/english/x',
      );
    });
  });

  describe('LEGACY_LOCALES / LEGACY_LOCALE_PATHS', () => {
    it('LEGACY_LOCALES is the single source of truth this middleware redirects on', () => {
      expect(LEGACY_LOCALES).toEqual(
        expect.arrayContaining(['fi', 'en', 'sv', 'ru', 'slangi']),
      );
    });

    it('LEGACY_LOCALE_PATHS is derived from LEGACY_LOCALES', () => {
      expect(LEGACY_LOCALE_PATHS).toEqual(
        LEGACY_LOCALES.map(locale => `/${locale}/`),
      );
    });
  });
});
