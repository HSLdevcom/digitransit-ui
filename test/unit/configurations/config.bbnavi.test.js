import { describe, it } from 'mocha';
import { expect } from 'chai';

import bbnaviConfig from '../../../app/configurations/config.bbnavi';

describe('bbnavi configuration', () => {
  describe('contains', () => {
    it('CONFIG key', () => {
      const result = bbnaviConfig.CONFIG;
      expect(result).to.equal('bbnavi');
    });
  });
});
