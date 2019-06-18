import { describe, it } from 'mocha';
import { expect } from 'chai';

import tampereConfig from '../../../app/configurations/config.tampere';

describe('tampere configuration', () => {
  describe.skip('realTime', () => {
    it('routeSelector should map the given props to something', () => {
      const props = {
        route: {
          shortName: 'foobar',
        },
      };
      const result = tampereConfig.realTime.tampere.routeSelector(props);
      expect(result).to.equal('foobar');
    });
  });

  describe('fareMapping', () => {
    it('should return an empty string for a missing fareId', () => {
      const result = tampereConfig.fareMapping(undefined);
      expect(result).to.equal('');
    });

    it('should return just the ticket name without feedId', () => {
      expect(tampereConfig.fareMapping('tampere:ABCDEFG')).to.equal('ABCDEFG');
    });
  });
});
