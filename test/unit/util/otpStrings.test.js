import * as utils from '../../../app/util/otpStrings';

describe('otpStrings', () => {
  describe('otpToLocation', () => {
    it('should parse address and coordinates', () => {
      const input = 'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365';
      const location = utils.otpToLocation(input);
      expect(location.address).toBe('Kluuvi, luoteinen, Kluuvi, Helsinki');
      expect(location.lat).toBe(60.173123);
      expect(location.lon).toBe(24.948365);
    });

    it('should ignore an invalid lat', () => {
      const input = 'Kluuvi, luoteinen, Kluuvi, Helsinki::foo,24.948365';
      const location = utils.otpToLocation(input);
      expect(location.address).toBe('Kluuvi, luoteinen, Kluuvi, Helsinki');
      expect(Object.prototype.hasOwnProperty.call(location, 'lat')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(location, 'lon')).toBe(false);
    });

    it('should ignore an invalid lon', () => {
      const input = 'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,foo';
      const location = utils.otpToLocation(input);
      expect(location.address).toBe('Kluuvi, luoteinen, Kluuvi, Helsinki');
      expect(Object.prototype.hasOwnProperty.call(location, 'lat')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(location, 'lon')).toBe(false);
    });

    it('should parse a valid slack time', () => {
      const input =
        'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365::1000';
      const location = utils.otpToLocation(input);
      expect(location.locationSlack).toBe(1000);
    });

    it('should parse a valid slack time when coordinates are invalid', () => {
      const input = 'Kluuvi, luoteinen, Kluuvi, Helsinki::foo,bar::1000';
      const location = utils.otpToLocation(input);
      expect(location.locationSlack).toBe(1000);
    });

    it('should ignore a missing slack time', () => {
      const input = 'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365';
      const location = utils.otpToLocation(input);
      expect(
        Object.prototype.hasOwnProperty.call(location, 'locationSlack'),
      ).toBe(false);
    });

    it('should ignore an invalid slack time', () => {
      const input =
        'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365::foo';
      const location = utils.otpToLocation(input);
      expect(
        Object.prototype.hasOwnProperty.call(location, 'locationSlack'),
      ).toBe(false);
    });
  });
  describe('getIntermediatePlaces', () => {
    it('should return an empty array for missing query', () => {
      const query = null;
      const result = utils.getIntermediatePlaces(query);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should return an empty array for missing intermediatePlaces', () => {
      const query = {};
      const result = utils.getIntermediatePlaces(query);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should return an empty array for whitespace intermediatePlaces', () => {
      const query = {
        intermediatePlaces: ' ',
      };
      const result = utils.getIntermediatePlaces(query);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should return a location parsed from a string-mode intermediatePlaces', () => {
      const query = {
        intermediatePlaces: 'Kera, Espoo::60.217992,24.75494',
      };
      const result = utils.getIntermediatePlaces(query);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].address).toBe('Kera, Espoo');
      expect(result[0].lat).toBe(60.217992);
      expect(result[0].lon).toBe(24.75494);
    });

    it('should return locations parsed from an array-mode intermediatePlaces', () => {
      const query = {
        intermediatePlaces: [
          'Kera, Espoo::60.217992,24.75494',
          'Leppävaara, Espoo::60.219235,24.81329',
        ],
      };
      const result = utils.getIntermediatePlaces(query);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0].address).toBe('Kera, Espoo');
      expect(result[0].lat).toBe(60.217992);
      expect(result[0].lon).toBe(24.75494);
      expect(result[1].address).toBe('Leppävaara, Espoo');
      expect(result[1].lat).toBe(60.219235);
      expect(result[1].lon).toBe(24.81329);
    });

    it('should return an empty array if intermediatePlaces is neither a string nor an array', () => {
      const query = {
        intermediatePlaces: {},
      };
      const result = utils.getIntermediatePlaces(query);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });
});
