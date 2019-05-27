import { expect } from 'chai';
import { describe, it } from 'mocha';

import { getNextDepartures } from '../../../app/component/FavouriteRouteListContainer';
import { AlertSeverityLevelType } from '../../../app/constants';

describe('<FavouriteRouteListContainer />', () => {
  describe('getNextDepartures', () => {
    it('should accept a routes list containing a null value (DT-2778)', () => {
      const routes = [null];
      const lat = 60.219235;
      const lon = 24.81329;
      const currentTime = 1558703670;
      const result = getNextDepartures(routes, lat, lon, currentTime);
      expect(result).to.deep.equal([]);
    });

    it('should map the active alertSeverityLevel if available', () => {
      const lat = 60.219235;
      const lon = 24.81329;
      const currentTime = 1558703670;
      const routes = [
        {
          alerts: [
            {
              alertSeverityLevel: AlertSeverityLevelType.Info,
              effectiveStartDate: currentTime,
            },
            {
              alertSeverityLevel: AlertSeverityLevelType.Warning,
              effectiveStartDate: currentTime + 1, // in the future
            },
          ],
          patterns: [
            {
              stops: [
                {
                  lat: 60,
                  lon: 25,
                  stoptimes: [
                    {
                      pattern: {
                        route: {},
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const result = getNextDepartures(routes, lat, lon, currentTime);
      expect(result[0].alertSeverityLevel).to.equal(
        AlertSeverityLevelType.Info,
      );
    });

    it('should map the correct alertSeverityLevel for each pattern', () => {
      const lat = 60.219235;
      const lon = 24.81329;
      const currentTime = 1558703670;
      const routes = [
        {
          alerts: [
            {
              alertSeverityLevel: AlertSeverityLevelType.Info,
              effectiveStartDate: currentTime,
              trip: {
                pattern: {
                  code: 'foo',
                },
              },
            },
            {
              alertSeverityLevel: AlertSeverityLevelType.Warning,
              effectiveStartDate: currentTime,
              trip: {
                pattern: {
                  code: 'bar',
                },
              },
            },
          ],
          patterns: [
            {
              code: 'foo',
              stops: [
                {
                  lat: 60,
                  lon: 25,
                  stoptimes: [
                    {
                      pattern: {
                        route: {},
                      },
                    },
                  ],
                },
              ],
            },
            {
              code: 'bar',
              stops: [
                {
                  lat: 60,
                  lon: 25,
                  stoptimes: [
                    {
                      pattern: {
                        route: {},
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const result = getNextDepartures(routes, lat, lon, currentTime);
      expect(result[0].alertSeverityLevel).to.equal(
        AlertSeverityLevelType.Info,
      );
    });
  });
});
