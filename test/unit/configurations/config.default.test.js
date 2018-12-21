import { describe, it } from 'mocha';
import { expect } from 'chai';

import defaultConfig from '../../../app/configurations/config.default';

describe('default configuration', () => {
  describe('realTime', () => {
    it('routeSelector should map the given props to something', () => {
      const props = {
        route: {
          gtfsId: 'HSL:12345',
        },
      };
      const result = defaultConfig.realTime.HSL.routeSelector(props);
      expect(result).to.equal('12345');
    });
  });
});
