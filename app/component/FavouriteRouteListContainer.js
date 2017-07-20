import { createFragmentContainer, graphql } from 'react-relay/compat';
import connectToStores from 'fluxible-addons-react/connectToStores';

import NextDeparturesList from './NextDeparturesList';
import { getDistanceToNearestStop } from '../util/geo-utils';

const getNextDepartures = (routes, lat, lon) => {
  const nextDepartures = [];
  const seenDepartures = {};

  routes.forEach(route => {
    const hasDisruption = route.alerts.length > 0;

    route.patterns.forEach(pattern => {
      const closest = getDistanceToNearestStop(lat, lon, pattern.stops);
      closest.stop.stoptimes
        .filter(stoptime => {
          const seenKey = `${stoptime.pattern.route.gtfsId}:${stoptime.pattern
            .headsign}`;
          const isSeen = seenDepartures[seenKey];
          const isFavourite =
            stoptime.pattern.route.gtfsId === route.gtfsId &&
            stoptime.pattern.headsign === pattern.headsign;

          if (!isSeen && isFavourite) {
            seenDepartures[seenKey] = true;
            return true;
          }
          return false;
        })
        .forEach(stoptime => {
          nextDepartures.push({
            distance: closest.distance,
            stoptime,
            hasDisruption,
          });
        });
    });
  });

  return nextDepartures;
};

// TODO: This should be moved above in the component hierarchy
const FavouriteRouteListContainer = connectToStores(
  NextDeparturesList,
  [],
  (context, { routes }) => {
    const PositionStore = context.getStore('PositionStore');
    const position = PositionStore.getLocationState();
    const origin = context.getStore('EndpointStore').getOrigin();
    const location = origin.useCurrentPosition ? position : origin;

    return {
      departures: getNextDepartures(routes, location.lat, location.lon),
    };
  },
);

// TODO: Add filtering in stoptimesForPatterns for route gtfsId
export default createFragmentContainer(FavouriteRouteListContainer, {
  routes: graphql.experimental`
    fragment FavouriteRouteListContainer_routes on Route
      @relay(plural: true)
      @argumentDefinitions(currentTime: { type: "Long" }) {
      alerts {
        id
      }
      patterns {
        headsign
        stops {
          lat
          lon
          stoptimes: stoptimesForPatterns(
            numberOfDepartures: 2
            startTime: $currentTime
            timeRange: 7200
          ) {
            pattern {
              code
              headsign
              route {
                gtfsId
                shortName
                longName
                mode
              }
            }
            stoptimes {
              realtimeState
              realtimeDeparture
              scheduledDeparture
              realtime
              serviceDay
            }
            pattern {
              headsign
              route {
                gtfsId
              }
            }
          }
        }
      }
      gtfsId
    }
  `,
});
