import config from '../../../app/configurations/config.hsl';

describe('HSL Configuration', () => {
  describe('fareMapping', () => {
    it('should return fare name without feedId', () => {
      expect(config.fareMapping('HSL:AB')).toBe('AB');
    });

    it('should work with a missing fareId', () => {
      expect(config.fareMapping(undefined)).toBe('');
      expect(config.fareMapping(null)).toBe('');
    });

    it('should work with a malformed fareId', () => {
      expect(config.fareMapping('HSL:')).toBe('');
    });

    it('should work with a non-string fareId', () => {
      expect(config.fareMapping({})).toBe('');
      expect(config.fareMapping(1234)).toBe('');
    });
  });
});
