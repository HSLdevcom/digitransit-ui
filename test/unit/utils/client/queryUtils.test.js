import { mockMatch } from '../../helpers/mock-router';

import * as utils from '../../../../utils/client/queryUtils';

const origin = {
  address: 'Origin, Helsinki',
  lat: 60.199,
  lon: 24.934,
};

const destination = {
  address: 'Destination, Helsinki',
  lat: 60.17,
  lon: 24.941,
};

const newOrigin = {
  address: 'New origin, Helsinki',
  lat: 60.201,
  lon: 24.935,
};

describe('queryUtils', () => {
  describe('onLocationPopup', () => {
    it('derives the other endpoint from match.params and updates the edited one', () => {
      let calledLocation;
      const router = {
        replace: location => {
          calledLocation = location;
        },
      };
      const match = {
        ...mockMatch,
        params: {
          from: `${origin.address}::${origin.lat},${origin.lon}`,
          to: `${destination.address}::${destination.lat},${destination.lon}`,
        },
      };

      utils.onLocationPopup(newOrigin, 'origin', router, match, {});

      expect(calledLocation.pathname).toContain(
        encodeURIComponent(newOrigin.address),
      );
      expect(calledLocation.pathname).toContain(
        encodeURIComponent(destination.address),
      );
    });

    it('adds a via point and does not navigate the origin/destination path', () => {
      let calledLocation;
      const router = {
        replace: location => {
          calledLocation = location;
        },
      };
      const match = {
        ...mockMatch,
        params: {
          from: `${origin.address}::${origin.lat},${origin.lon}`,
          to: `${destination.address}::${destination.lat},${destination.lon}`,
        },
      };
      const viaPointActions = {
        addViaPoint: vi.fn(),
        deleteViaPoint: vi.fn(),
      };
      const config = { viaPointsMax: 5 };

      utils.onLocationPopup(
        newOrigin,
        'via',
        router,
        match,
        viaPointActions,
        config,
      );

      expect(viaPointActions.addViaPoint).toHaveBeenCalledWith(newOrigin);
      expect(calledLocation.query.intermediatePlaces).toBeDefined();
    });
  });

  describe('setIntermediatePlaces', () => {
    it('should not modify the query if the parameter is neither a string nor an array', () => {
      let callParams;
      const router = {
        replace: params => {
          callParams = params;
        },
      };
      utils.setIntermediatePlaces(router, mockMatch, {});
      expect(callParams).toBeUndefined();
    });

    it('should not modify the query if the parameter is an array but not a string array', () => {
      let callParams;
      const router = {
        replace: params => {
          callParams = params;
        },
      };
      const intermediatePlaces = [
        {
          lat: 60.217992,
          lon: 24.75494,
          address: 'Kera, Espoo',
        },
        {
          lat: 60.219235,
          lon: 24.81329,
          address: 'Leppävaara, Espoo',
        },
      ];

      utils.setIntermediatePlaces(router, mockMatch, intermediatePlaces);

      expect(callParams).toBeUndefined();
    });

    it('should modify the query if the parameter is a string', () => {
      let callParams;
      const router = {
        replace: params => {
          callParams = params;
        },
      };
      const intermediatePlace = 'Kera, Espoo::60.217992,24.75494';

      utils.setIntermediatePlaces(router, mockMatch, intermediatePlace);

      expect(callParams.query.intermediatePlaces).toBe(intermediatePlace);
    });

    it('should modify the query if the parameter is a string array', () => {
      let callParams;
      const router = {
        replace: params => {
          callParams = params;
        },
      };
      const intermediatePlaces = [
        'Kera, Espoo::60.217992,24.75494',
        'Leppävaara, Espoo::60.219235,24.81329',
      ];

      utils.setIntermediatePlaces(router, mockMatch, intermediatePlaces);

      expect(callParams.query.intermediatePlaces).toEqual(intermediatePlaces);
    });
  });
});
