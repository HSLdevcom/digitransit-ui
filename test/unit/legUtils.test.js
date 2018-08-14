import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as utils from '../../app/util/legUtils';

describe('legUtils', () => {
  describe('getLegMode', () => {
    it('should return undefined for a null leg', () => {
      const leg = null;
      const mode = utils.getLegMode(leg);
      expect(mode).to.equal(undefined);
    });

    it('should return undefined for a null mode', () => {
      const leg = {
        mode: null,
      };
      const mode = utils.getLegMode(leg);
      expect(mode).to.equal(undefined);
    });

    it('should return undefined for an unknown mode', () => {
      const leg = {
        mode: 'invalid',
      };
      const mode = utils.getLegMode(leg);
      expect(mode).to.equal(undefined);
    });

    it('should be case-insensitive', () => {
      const leg = {
        mode: 'citybike',
      };
      const mode = utils.getLegMode(leg);
      expect(mode).to.equal(utils.LegMode.CityBike);
    });

    it('should return the mode for a string literal mode', () => {
      const literalMode = 'WALK';
      const mode = utils.getLegMode(literalMode);
      expect(mode).to.equal(utils.LegMode.Walk);
    });

    it('should return the mode for a string object mode', () => {
      // eslint-disable-next-line no-new-wrappers
      const objectMode = new String('WALK');
      const mode = utils.getLegMode(objectMode);
      expect(mode).to.equal(utils.LegMode.Walk);
    });
  });

  describe('getTotalWalkingDistance', () => {
    it('should return 0 if there are no legs available', () => {
      const itinerary = {
        legs: [],
      };
      const distance = utils.getTotalWalkingDistance(itinerary);
      expect(distance).to.equal(0);
    });

    it('should include only walking legs', () => {
      const itinerary = {
        legs: [
          {
            distance: 2,
            mode: utils.LegMode.Walk,
          },
          {
            distance: 3,
            mode: utils.LegMode.Bicycle,
          },
        ],
      };
      const distance = utils.getTotalWalkingDistance(itinerary);
      expect(distance).to.equal(2);
    });

    it('should include all walking legs', () => {
      const itinerary = {
        legs: [
          {
            distance: 2,
            mode: utils.LegMode.Walk,
          },
          {
            distance: 3,
            mode: utils.LegMode.Bicycle,
          },
          {
            distance: 1,
            mode: utils.LegMode.Walk,
          },
        ],
      };
      const distance = utils.getTotalWalkingDistance(itinerary);
      expect(distance).to.equal(4);
    });
  });
});
