import { otpToLocation } from '../../../../utils/shared/otpStrings';

describe('otpStrings', () => {
  describe('otpToLocation', () => {
    it('should parse address and coordinates', () => {
      const input = 'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365';
      const location = otpToLocation(input);
      expect(location.address).toBe('Kluuvi, luoteinen, Kluuvi, Helsinki');
      expect(location.lat).toBe(60.173123);
      expect(location.lon).toBe(24.948365);
    });

    it('should ignore an invalid lat', () => {
      const input = 'Kluuvi, luoteinen, Kluuvi, Helsinki::foo,24.948365';
      const location = otpToLocation(input);
      expect(location.address).toBe('Kluuvi, luoteinen, Kluuvi, Helsinki');
      expect(Object.prototype.hasOwnProperty.call(location, 'lat')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(location, 'lon')).toBe(false);
    });

    it('should ignore an invalid lon', () => {
      const input = 'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,foo';
      const location = otpToLocation(input);
      expect(location.address).toBe('Kluuvi, luoteinen, Kluuvi, Helsinki');
      expect(Object.prototype.hasOwnProperty.call(location, 'lat')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(location, 'lon')).toBe(false);
    });

    it('should parse a valid slack time', () => {
      const input =
        'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365::1000';
      const location = otpToLocation(input);
      expect(location.locationSlack).toBe(1000);
    });

    it('should parse a valid slack time when coordinates are invalid', () => {
      const input = 'Kluuvi, luoteinen, Kluuvi, Helsinki::foo,bar::1000';
      const location = otpToLocation(input);
      expect(location.locationSlack).toBe(1000);
    });

    it('should ignore a missing slack time', () => {
      const input = 'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365';
      const location = otpToLocation(input);
      expect(
        Object.prototype.hasOwnProperty.call(location, 'locationSlack'),
      ).toBe(false);
    });

    it('should ignore an invalid slack time', () => {
      const input =
        'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365::foo';
      const location = otpToLocation(input);
      expect(
        Object.prototype.hasOwnProperty.call(location, 'locationSlack'),
      ).toBe(false);
    });
  });
});
