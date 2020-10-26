import { expect } from 'chai';
import { describe, it } from 'mocha';

import { mockMatch } from '../helpers/mock-router';

import * as utils from '../../../app/util/queryUtils';
import { PREFIX_ITINERARY_SUMMARY } from '../../../app/util/path';

describe('queryUtils', () => {
  describe('setIntermediatePlaces', () => {
    it('should not modify the query if the parameter is neither a string nor an array', () => {
      let callParams;
      const router = {
        replace: params => {
          callParams = params;
        },
      };
      utils.setIntermediatePlaces(router, mockMatch, {});
      expect(callParams).to.equal(undefined);
    });

    it('should not modify the query if the parameter is an array but not a string array', () => {
      let callParams;
      const router = {
        replace: params => {
          callParams = params;
        },
      };
      const intermediatePlaces = [
        {
          lat: 60.217992,
          lon: 24.75494,
          address: 'Kera, Espoo',
        },
        {
          lat: 60.219235,
          lon: 24.81329,
          address: 'Leppävaara, Espoo',
        },
      ];

      utils.setIntermediatePlaces(router, mockMatch, intermediatePlaces);

      expect(callParams).to.equal(undefined);
    });

    it('should modify the query if the parameter is a string', () => {
      let callParams;
      const router = {
        replace: params => {
          callParams = params;
        },
      };
      const intermediatePlace = 'Kera, Espoo::60.217992,24.75494';

      utils.setIntermediatePlaces(router, mockMatch, intermediatePlace);

      expect(callParams.query.intermediatePlaces).to.equal(intermediatePlace);
    });

    it('should modify the query if the parameter is a string array', () => {
      let callParams;
      const router = {
        replace: params => {
          callParams = params;
        },
      };
      const intermediatePlaces = [
        'Kera, Espoo::60.217992,24.75494',
        'Leppävaara, Espoo::60.219235,24.81329',
      ];

      utils.setIntermediatePlaces(router, mockMatch, intermediatePlaces);

      expect(callParams.query.intermediatePlaces).to.deep.equal(
        intermediatePlaces,
      );
    });
  });

  describe('resetSelectedItineraryIndex', () => {
    it('should reset state.summaryPageSelected to 0', () => {
      let location = {
        state: {
          summaryPageSelected: 3,
        },
      };
      location = utils.resetSelectedItineraryIndex(location);
      expect(location.state.summaryPageSelected).to.equal(0);
    });

    it('should not modify other state properties', () => {
      const location1 = {
        state: {
          foo: 'bar',
        },
      };
      const location2 = utils.resetSelectedItineraryIndex(location1);
      expect(location1).to.deep.equal(location2);
    });

    it('should remove selected itinerary index from url', () => {
      let location = {
        pathname: `/${PREFIX_ITINERARY_SUMMARY}/Helsinki%2C Helsinki%3A%3A60.166641%2C24.943537/Espoo%2C Espoo%3A%3A60.206376%2C24.656729/1`,
      };
      location = utils.resetSelectedItineraryIndex(location);
      expect(location.pathname).to.equal(
        `/${PREFIX_ITINERARY_SUMMARY}/Helsinki%2C Helsinki%3A%3A60.166641%2C24.943537/Espoo%2C Espoo%3A%3A60.206376%2C24.656729`,
      );
    });

    it('should not modify url without itinerary index', () => {
      let location = {
        pathname: `/${PREFIX_ITINERARY_SUMMARY}/Helsinki%2C Helsinki%3A%3A60.166641%2C24.943537/Espoo%2C Espoo%3A%3A60.206376%2C24.656729`,
      };
      location = utils.resetSelectedItineraryIndex(location);
      expect(location.pathname).to.equal(
        `/${PREFIX_ITINERARY_SUMMARY}/Helsinki%2C Helsinki%3A%3A60.166641%2C24.943537/Espoo%2C Espoo%3A%3A60.206376%2C24.656729`,
      );
    });
  });
});
