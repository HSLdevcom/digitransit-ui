import { expect } from 'chai';
import { describe, it } from 'mocha';

import * as utils from '../../../app/util/otpStrings';

describe('otpStrings', () => {
  describe('otpToLocation', () => {
    it('should parse address and coordinates', () => {
      const input = 'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365';
      const location = utils.otpToLocation(input);
      expect(location.address).to.equal('Kluuvi, luoteinen, Kluuvi, Helsinki');
      expect(location.lat).to.equal(60.173123);
      expect(location.lon).to.equal(24.948365);
    });

    it('should ignore an invalid lat', () => {
      const input = 'Kluuvi, luoteinen, Kluuvi, Helsinki::foo,24.948365';
      const location = utils.otpToLocation(input);
      expect(location.address).to.equal('Kluuvi, luoteinen, Kluuvi, Helsinki');
      expect(Object.prototype.hasOwnProperty.call(location, 'lat')).to.equal(
        false,
      );
      expect(Object.prototype.hasOwnProperty.call(location, 'lon')).to.equal(
        false,
      );
    });

    it('should ignore an invalid lon', () => {
      const input = 'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,foo';
      const location = utils.otpToLocation(input);
      expect(location.address).to.equal('Kluuvi, luoteinen, Kluuvi, Helsinki');
      expect(Object.prototype.hasOwnProperty.call(location, 'lat')).to.equal(
        false,
      );
      expect(Object.prototype.hasOwnProperty.call(location, 'lon')).to.equal(
        false,
      );
    });

    it('should parse a valid slack time', () => {
      const input =
        'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365::1000';
      const location = utils.otpToLocation(input);
      expect(location.locationSlack).to.equal(1000);
    });

    it('should parse a valid slack time when coordinates are invalid', () => {
      const input = 'Kluuvi, luoteinen, Kluuvi, Helsinki::foo,bar::1000';
      const location = utils.otpToLocation(input);
      expect(location.locationSlack).to.equal(1000);
    });

    it('should ignore a missing slack time', () => {
      const input = 'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365';
      const location = utils.otpToLocation(input);
      expect(
        Object.prototype.hasOwnProperty.call(location, 'locationSlack'),
      ).to.equal(false);
    });

    it('should ignore an invalid slack time', () => {
      const input =
        'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365::foo';
      const location = utils.otpToLocation(input);
      expect(
        Object.prototype.hasOwnProperty.call(location, 'locationSlack'),
      ).to.equal(false);
    });
  });
  describe('getIntermediatePlaces', () => {
    it('should return an empty array for missing query', () => {
      const query = null;
      const result = utils.getIntermediatePlaces(query);
      expect(Array.isArray(result)).to.equal(true);
      expect(result.length).to.equal(0);
    });

    it('should return an empty array for missing intermediatePlaces', () => {
      const query = {};
      const result = utils.getIntermediatePlaces(query);
      expect(Array.isArray(result)).to.equal(true);
      expect(result.length).to.equal(0);
    });

    it('should return an empty array for whitespace intermediatePlaces', () => {
      const query = {
        intermediatePlaces: ' ',
      };
      const result = utils.getIntermediatePlaces(query);
      expect(Array.isArray(result)).to.equal(true);
      expect(result.length).to.equal(0);
    });

    it('should return a location parsed from a string-mode intermediatePlaces', () => {
      const query = {
        intermediatePlaces: 'Kera, Espoo::60.217992,24.75494',
      };
      const result = utils.getIntermediatePlaces(query);
      expect(Array.isArray(result)).to.equal(true);
      expect(result.length).to.equal(1);
      expect(result[0].address).to.equal('Kera, Espoo');
      expect(result[0].lat).to.equal(60.217992);
      expect(result[0].lon).to.equal(24.75494);
    });

    it('should return locations parsed from an array-mode intermediatePlaces', () => {
      const query = {
        intermediatePlaces: [
          'Kera, Espoo::60.217992,24.75494',
          'Leppävaara, Espoo::60.219235,24.81329',
        ],
      };
      const result = utils.getIntermediatePlaces(query);
      expect(Array.isArray(result)).to.equal(true);
      expect(result.length).to.equal(2);
      expect(result[0].address).to.equal('Kera, Espoo');
      expect(result[0].lat).to.equal(60.217992);
      expect(result[0].lon).to.equal(24.75494);
      expect(result[1].address).to.equal('Leppävaara, Espoo');
      expect(result[1].lat).to.equal(60.219235);
      expect(result[1].lon).to.equal(24.81329);
    });

    it('should return an empty array if intermediatePlaces is neither a string nor an array', () => {
      const query = {
        intermediatePlaces: {},
      };
      const result = utils.getIntermediatePlaces(query);
      expect(Array.isArray(result)).to.equal(true);
      expect(result.length).to.equal(0);
    });
  });
});
