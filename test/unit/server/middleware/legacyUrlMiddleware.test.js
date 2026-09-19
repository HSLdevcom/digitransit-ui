import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
  validateParams,
  dropPathLanguageAndFixLocaleParam,
} from '../../../../server/middleware/legacyUrlMiddleware';

import config from '../../../../server/configs/config.default';
import { LEGACY_LOCALE_PATH_SEGMENTS } from '../../../../utils/shared/constants';
import { PREFIX_ITINERARY_SUMMARY } from '../../../../utils/shared/path';

// validateParams returns an url if it is modified and it removes invalid
// parameteres from req.query => two ways to check if it did what it should

describe('legacyUrlMiddleware', () => {
  describe('validateParams', () => {
    const req = {
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
      expect(url).to.be.a('undefined');
    });

    it('should remove invalid time parameter', () => {
      req.query.time = 'test';
      validateParams(req, config);
      expect(req.query.time).to.be.an('undefined');
    });
  });

  describe('dropLanguageAndSetLocaleParam', () => {
    const req = {
      path: '/en/',
      query: {
        locale: 'fi',
      },
    };

    it('should return empty path with "locale" query param', () => {
      const relativeUrl = dropPathLanguageAndFixLocaleParam(req, 'en');
      expect(relativeUrl).to.equal('/?locale=en');
    });

    it('should return path without language', () => {
      req.path = `/sv/${PREFIX_ITINERARY_SUMMARY}/Rautatientori%2C%20Helsinki%3A%3A60.171283%2C24.942572/Pasila%2C%20Helsinki%3A%3A60.199017%2C24.933973`;
      const relativeUrl = dropPathLanguageAndFixLocaleParam(req, 'sv');
      expect(relativeUrl).to.equal(
        `/${PREFIX_ITINERARY_SUMMARY}/Rautatientori%2C%20Helsinki%3A%3A60.171283%2C24.942572/Pasila%2C%20Helsinki%3A%3A60.199017%2C24.933973?locale=sv`,
      );
    });

    it('should not ignore URL parameters', () => {
      req.path = `/en/${PREFIX_ITINERARY_SUMMARY}/Otaniemi,%20Espoo::60.187938,24.83182/Rautatientori,%20Asemanaukio%202,%20Helsinki::60.170384,24.939846`;
      req.query = {
        time: 1565074800,
        arriveBy: false,
        locale: 'fi',
      };

      const relativeUrl = dropPathLanguageAndFixLocaleParam(req, 'en');
      expect(relativeUrl).to.equal(
        `/${PREFIX_ITINERARY_SUMMARY}/Otaniemi,%20Espoo::60.187938,24.83182/Rautatientori,%20Asemanaukio%202,%20Helsinki::60.170384,24.939846?time=1565074800&arriveBy=false&locale=en`,
      );
    });

    it('should drop the special "slangi" pseudo-locale to the "fi" query param', () => {
      req.path = '/slangi/';
      req.query = {};
      const relativeUrl = dropPathLanguageAndFixLocaleParam(req, 'slangi');
      expect(relativeUrl).to.equal('/?locale=fi');
    });
  });

  describe('LEGACY_LOCALE_PATH_SEGMENTS', () => {
    it('is the single source of truth this middleware redirects on', () => {
      expect(LEGACY_LOCALE_PATH_SEGMENTS).to.include.members([
        'fi',
        'en',
        'sv',
        'ru',
        'slangi',
      ]);
    });
  });
});
