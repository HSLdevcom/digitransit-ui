import { describe, it } from 'vitest';

import defaultConfig from '../../../../server/configs/config.default';

describe('default configuration', () => {
  describe('realTime', () => {
    it('routeSelector should map the given props to something', () => {
      const props = {
        route: {
          gtfsId: 'HSL:12345',
        },
      };
      const result = defaultConfig.realTime.HSL.routeSelector(props);
      expect(result).toBe('12345');
    });
  });
});
