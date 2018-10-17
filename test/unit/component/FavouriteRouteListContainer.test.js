import { expect } from 'chai';
import { describe, it } from 'mocha';

import { getNextDepartures } from '../../../app/component/FavouriteRouteListContainer';

describe('<FavouriteRouteListContainer />', () => {
  describe('getNextDepartures', () => {
    it('should accept a routes list containing a null value (DT-2778)', () => {
      const routes = [null];
      const lat = 60.219235;
      const lon = 24.81329;
      const result = getNextDepartures(routes, lat, lon);
      expect(result).to.deep.equal([]);
    });
  });
});
