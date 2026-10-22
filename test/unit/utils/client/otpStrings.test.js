import { getIntermediatePlaces } from '../../../../utils/client/otpStrings';

describe('otpStrings', () => {
  describe('getIntermediatePlaces', () => {
    it('should return an empty array for missing query', () => {
      const query = null;
      const result = getIntermediatePlaces(query);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should return an empty array for missing intermediatePlaces', () => {
      const query = {};
      const result = getIntermediatePlaces(query);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should return an empty array for whitespace intermediatePlaces', () => {
      const query = {
        intermediatePlaces: ' ',
      };
      const result = getIntermediatePlaces(query);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should return a location parsed from a string-mode intermediatePlaces', () => {
      const query = {
        intermediatePlaces: 'Kera, Espoo::60.217992,24.75494',
      };
      const result = getIntermediatePlaces(query);
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
      const result = getIntermediatePlaces(query);
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
      const result = getIntermediatePlaces(query);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });
});
