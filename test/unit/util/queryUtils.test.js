import { expect } from 'chai';
import { describe, it } from 'mocha';

import { mockMatch } from '../helpers/mock-router';

import * as utils from '../../../app/util/queryUtils';
import { OptimizeType } from '../../../app/constants';
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

  describe('getPreferGreenways', () => {
    it('should be enabled if OptimizeType is GREENWAYS', () => {
      const result = utils.getPreferGreenways(OptimizeType.Greenways);
      expect(result).to.equal(true);
    });

    it('should be enabled if OptimizeType is TRIANGLE and safetyFactor is high enough', () => {
      const result = utils.getPreferGreenways(OptimizeType.Triangle, {
        safetyFactor: 0.45,
      });
      expect(result).to.equal(true);
    });

    it('should be disabled if OptimizeType is TRIANGLE and safetyFactor is not high enough', () => {
      const result = utils.getPreferGreenways(OptimizeType.Triangle, {
        safetyFactor: 0.44,
      });
      expect(result).to.equal(false);
    });

    it('should be disabled for other OptimizeTypes', () => {
      expect(utils.getPreferGreenways(OptimizeType.Flat)).to.equal(false);
      expect(utils.getPreferGreenways(OptimizeType.Quick)).to.equal(false);
      expect(utils.getPreferGreenways(OptimizeType.Safe)).to.equal(false);
    });
  });

  describe('getAvoidElevationChanges', () => {
    it('should be enabled if OptimizeType is TRIANGLE and slopeFactor is high enough', () => {
      const result = utils.getAvoidElevationChanges(OptimizeType.Triangle, {
        slopeFactor: 0.45,
      });
      expect(result).to.equal(true);
    });

    it('should be disabled if OptimizeType is TRIANGLE and slopeFactor is not high enough', () => {
      const result = utils.getAvoidElevationChanges(OptimizeType.Triangle, {
        slopeFactor: 0.44,
      });
      expect(result).to.equal(false);
    });

    it('should be disabled for other OptimizeTypes', () => {
      expect(utils.getAvoidElevationChanges(OptimizeType.Flat)).to.equal(false);
      expect(utils.getAvoidElevationChanges(OptimizeType.Greenways)).to.equal(
        false,
      );
      expect(utils.getAvoidElevationChanges(OptimizeType.Quick)).to.equal(
        false,
      );
      expect(utils.getAvoidElevationChanges(OptimizeType.Safe)).to.equal(false);
    });
  });

  describe('setPreferGreenways', () => {
    it('should not call replace on router if already enabled', () => {
      let callCount = 0;
      const router = {
        replace: () => {
          callCount += 1;
        },
      };
      utils.setPreferGreenways(router, mockMatch, OptimizeType.Greenways);
      expect(callCount).to.equal(0);
    });

    it('should call replace on router even if already enabled when forced', () => {
      let callParams;
      const router = {
        replace: params => {
          callParams = params;
        },
      };
      utils.setPreferGreenways(
        router,
        mockMatch,
        OptimizeType.Greenways,
        {},
        true,
      );
      expect(callParams.query.optimize).to.equal(OptimizeType.Greenways);
    });

    it('should call replace on router when disabled', () => {
      let callCount = 0;
      const router = {
        replace: () => {
          callCount += 1;
        },
      };
      utils.setPreferGreenways(router, mockMatch, OptimizeType.Quick);
      expect(callCount).to.equal(1);
    });

    it('should use OptimizeType TRIANGLE when other triangle factors are in use', () => {
      let callParams;
      const router = {
        replace: params => {
          callParams = params;
        },
      };
      utils.setPreferGreenways(router, mockMatch, OptimizeType.Triangle, {
        safetyFactor: utils.FACTOR_DISABLED,
        slopeFactor: utils.ONE_FACTOR_ENABLED,
        timeFactor: utils.FACTOR_DISABLED,
      });
      expect(callParams.query).to.deep.equal({
        optimize: OptimizeType.Triangle,
        safetyFactor: utils.TWO_FACTORS_ENABLED,
        slopeFactor: utils.TWO_FACTORS_ENABLED,
        timeFactor: utils.FACTOR_DISABLED,
      });
    });
  });

  describe('setAvoidElevationChanges', () => {
    it('should not call replace on router if already enabled', () => {
      let callCount = 0;
      const router = {
        replace: () => {
          callCount += 1;
        },
      };
      utils.setAvoidElevationChanges(router, mockMatch, OptimizeType.Triangle, {
        slopeFactor: utils.ONE_FACTOR_ENABLED,
      });
      expect(callCount).to.equal(0);
    });

    it('should call replace on router even if already enabled when forced', () => {
      let callParams;
      const router = {
        replace: params => {
          callParams = params;
        },
      };
      utils.setAvoidElevationChanges(
        router,
        mockMatch,
        OptimizeType.Triangle,
        {
          safetyFactor: utils.TWO_FACTORS_ENABLED,
          slopeFactor: utils.TWO_FACTORS_ENABLED,
          timeFactor: utils.FACTOR_DISABLED,
        },
        true,
      );
      expect(callParams.query).to.deep.equal({
        optimize: OptimizeType.Triangle,
        safetyFactor: utils.FACTOR_DISABLED,
        slopeFactor: utils.ONE_FACTOR_ENABLED,
        timeFactor: utils.FACTOR_DISABLED,
      });
    });

    it('should call replace on router when disabled', () => {
      let callCount = 0;
      const router = {
        replace: () => {
          callCount += 1;
        },
      };
      utils.setAvoidElevationChanges(router, mockMatch, OptimizeType.Quick);
      expect(callCount).to.equal(1);
    });

    it('should use OptimizeType TRIANGLE when other triangle factors are in use', () => {
      let callParams;
      const router = {
        replace: params => {
          callParams = params;
        },
      };
      utils.setAvoidElevationChanges(router, mockMatch, OptimizeType.Triangle, {
        safetyFactor: utils.ONE_FACTOR_ENABLED,
        slopeFactor: utils.FACTOR_DISABLED,
        timeFactor: utils.FACTOR_DISABLED,
      });
      expect(callParams.query).to.deep.equal({
        optimize: OptimizeType.Triangle,
        safetyFactor: utils.TWO_FACTORS_ENABLED,
        slopeFactor: utils.TWO_FACTORS_ENABLED,
        timeFactor: utils.FACTOR_DISABLED,
      });
    });

    it('should convert to OptimizeType TRIANGLE when the current OptimizeType is GREENWAYS', () => {
      let callParams;
      const router = {
        replace: params => {
          callParams = params;
        },
      };
      utils.setAvoidElevationChanges(router, mockMatch, OptimizeType.Greenways);
      expect(callParams.query).to.deep.equal({
        optimize: OptimizeType.Triangle,
        safetyFactor: utils.TWO_FACTORS_ENABLED,
        slopeFactor: utils.TWO_FACTORS_ENABLED,
        timeFactor: utils.FACTOR_DISABLED,
      });
    });
  });

  describe('resetPreferGreenways', () => {
    it('should not call replace on router if already disabled', () => {
      let callCount = 0;
      const router = {
        replace: () => {
          callCount += 1;
        },
      };
      utils.resetPreferGreenways(
        router,
        mockMatch,
        OptimizeType.Safe,
        {},
        OptimizeType.Quick,
      );
      expect(callCount).to.equal(0);
    });

    it('should switch to just one factor enabled if two factors are currently enabled', () => {
      let callParams;
      const router = {
        replace: params => {
          callParams = params;
        },
      };
      utils.resetPreferGreenways(
        router,
        mockMatch,
        OptimizeType.Triangle,
        {
          safetyFactor: utils.TWO_FACTORS_ENABLED,
          slopeFactor: utils.TWO_FACTORS_ENABLED,
          timeFactor: utils.FACTOR_DISABLED,
        },
        OptimizeType.Quick,
      );
      expect(callParams.query).to.deep.equal({
        optimize: OptimizeType.Triangle,
        safetyFactor: utils.FACTOR_DISABLED,
        slopeFactor: utils.ONE_FACTOR_ENABLED,
        timeFactor: utils.FACTOR_DISABLED,
      });
    });

    it('should switch to default optimize', () => {
      let callParams;
      const router = {
        replace: params => {
          callParams = params;
        },
      };
      utils.resetPreferGreenways(
        router,
        mockMatch,
        OptimizeType.Greenways,
        {},
        OptimizeType.Quick,
      );
      expect(callParams.query).to.deep.equal({
        optimize: OptimizeType.Quick,
      });
    });
  });

  describe('resetAvoidElevationChanges', () => {
    it('should not call replace on router if already disabled', () => {
      let callCount = 0;
      const router = {
        replace: () => {
          callCount += 1;
        },
      };
      utils.resetAvoidElevationChanges(
        router,
        mockMatch,
        OptimizeType.Safe,
        {},
        OptimizeType.Quick,
      );
      expect(callCount).to.equal(0);
    });

    it('should switch to just one factor enabled if two factors are currently enabled', () => {
      let callParams;
      const router = {
        replace: params => {
          callParams = params;
        },
      };
      utils.resetAvoidElevationChanges(
        router,
        mockMatch,
        OptimizeType.Triangle,
        {
          safetyFactor: utils.TWO_FACTORS_ENABLED,
          slopeFactor: utils.TWO_FACTORS_ENABLED,
          timeFactor: utils.FACTOR_DISABLED,
        },
        OptimizeType.Quick,
      );
      expect(callParams.query).to.deep.equal({
        optimize: OptimizeType.Greenways,
      });
    });

    it('should switch to default optimize', () => {
      let callParams;
      const router = {
        replace: params => {
          callParams = params;
        },
      };
      utils.resetAvoidElevationChanges(
        router,
        mockMatch,
        OptimizeType.Triangle,
        {
          safetyFactor: utils.FACTOR_DISABLED,
          slopeFactor: utils.ONE_FACTOR_ENABLED,
          timeFactor: utils.FACTOR_DISABLED,
        },
        OptimizeType.Quick,
      );
      expect(callParams.query).to.deep.equal({
        optimize: OptimizeType.Quick,
      });
    });
  });
});
