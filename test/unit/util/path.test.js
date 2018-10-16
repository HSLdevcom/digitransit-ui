import { expect } from 'chai';
import { describe, it } from 'mocha';
import { createMemoryHistory } from 'react-router';

import * as utils from '../../../app/util/path';

describe('path', () => {
  describe('navigateTo', () => {
    const mockOrigin = {
      lat: 60.169196,
      lon: 24.957674,
      address: 'Aleksanterinkatu, Helsinki',
      set: true,
      ready: true,
    };

    const mockDestination = {
      lat: 60.199093,
      lon: 24.940536,
      address: 'Opastinsilta 6, Helsinki',
      set: true,
      ready: true,
    };

    it('should reset selected itinerary index to 0 if resetIndex=true', () => {
      const mockBase = {
        state: {
          summaryPageSelected: 2,
        },
      };
      const router = createMemoryHistory();
      utils.navigateTo({
        origin: mockOrigin,
        destination: mockDestination,
        context: '',
        router,
        base: mockBase,
        resetIndex: true,
      });
      const location = router.getCurrentLocation();
      expect(location.state.summaryPageSelected).to.equal(0);
    });

    it('should not reset selected itinerary index when not required', () => {
      const mockBase = {
        state: {
          summaryPageSelected: 2,
        },
      };
      const router = createMemoryHistory();
      utils.navigateTo({
        origin: mockOrigin,
        destination: mockDestination,
        context: '',
        router,
        base: mockBase,
      });
      const location = router.getCurrentLocation();
      expect(location.state.summaryPageSelected).to.equal(2);
    });
  });
});
