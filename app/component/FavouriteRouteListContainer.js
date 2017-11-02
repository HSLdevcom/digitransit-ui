import Relay from 'react-relay/classic';
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
  ['TimeStore'],
  (context, { routes, origin }) => ({
    currentTime: context
      .getStore('TimeStore')
      .getCurrentTime()
      .unix(),
    departures: getNextDepartures(routes, origin.lat, origin.lon),
  }),
);

// TODO: Add filtering in stoptimesForPatterns for route gtfsId
export default Relay.createContainer(FavouriteRouteListContainer, {
  fragments: {
    routes: () => Relay.QL`
      fragment on Route @relay(plural:true) {
        alerts {
          id
        }
        patterns {
          headsign
          stops {
            lat
            lon
            stoptimes: stoptimesForPatterns (
                numberOfDepartures:2, startTime: $currentTime, timeRange: 7200
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
                route { gtfsId }
              }
            }
          }
        }
        gtfsId
      }
   `,
  },

  initialVariables: {
    currentTime: '0',
  },
});
