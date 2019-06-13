import { expect } from 'chai';
import { describe, it } from 'mocha';

import config from '../../../app/configurations/config.hsl';

describe('HSL Configuration', () => {
  describe('fareMapping', () => {
    it('should return fare name without feedId', () => {
      expect(config.fareMapping('HSL:AB')).to.equal('AB');
    });

    it('should work with a missing fareId', () => {
      expect(config.fareMapping(undefined)).to.equal('');
      expect(config.fareMapping(null)).to.equal('');
    });

    it('should work with a malformed fareId', () => {
      expect(config.fareMapping('HSL:')).to.equal('');
    });

    it('should work with a non-string fareId', () => {
      expect(config.fareMapping({})).to.equal('');
      expect(config.fareMapping(1234)).to.equal('');
    });
  });
});
