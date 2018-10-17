import { expect } from 'chai';
import { describe, it } from 'mocha';

import config from '../../../app/configurations/config.hsl';

const fareZones = ['AB', 'BC', 'CD', 'D', 'ABC', 'BCD', 'ABCD'];

describe('HSL Configuration', () => {
  describe('fareMapping', () => {
    it('should map all the configured fares', () => {
      const mapped = config.fares.map(config.fareMapping);
      expect(mapped).to.have.lengthOf(config.fares.length);
      expect(mapped.some(value => value === '')).to.equal(false);
    });

    it('should include all the fare zones', () => {
      const mapped = config.fares.map(config.fareMapping);
      expect(mapped).to.deep.equal(fareZones);
    });

    it('should ignore the language parameter', () => {
      const mappedFi = config.fares.map(fareId =>
        config.fareMapping(fareId, 'fi'),
      );
      const mappedEn = config.fares.map(fareId =>
        config.fareMapping(fareId, 'en'),
      );

      expect(mappedFi).to.deep.equal(mappedEn);
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
