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
});
