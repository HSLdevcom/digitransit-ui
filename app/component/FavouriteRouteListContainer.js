import Relay from 'react-relay/classic';
import connectToStores from 'fluxible-addons-react/connectToStores';

import NextDeparturesList from './NextDeparturesList';
import { RouteAlertsQuery } from '../util/alertQueries';
import {
  getActiveAlertSeverityLevel,
  patternIdPredicate,
} from '../util/alertUtils';
import { getDistanceToNearestStop } from '../util/geo-utils';

export const getNextDepartures = (routes, lat, lon, currentTime) => {
  const nextDepartures = [];
  const seenDepartures = {};

  routes.forEach(route => {
    if (!route) {
      return;
    }

    route.patterns.forEach(pattern => {
      const patternAlerts =
        Array.isArray(route.alerts) &&
        route.alerts.filter(alert => patternIdPredicate(alert, pattern.code));
      const alertSeverityLevel = getActiveAlertSeverityLevel(
        patternAlerts || [],
        currentTime,
      );
      const closest = getDistanceToNearestStop(lat, lon, pattern.stops);
      closest.stop.stoptimes
        .filter(stoptime => {
          const seenKey = `${stoptime.pattern.route.gtfsId}:${
            stoptime.pattern.headsign
          }`;
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
            alertSeverityLevel,
            distance: closest.distance,
            stoptime,
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
  (context, { routes, origin }) => {
    const currentTime = context
      .getStore('TimeStore')
      .getCurrentTime()
      .unix();
    return {
      currentTime,
      departures: getNextDepartures(
        routes,
        origin.lat,
        origin.lon,
        currentTime,
      ),
    };
  },
);

// TODO: Add filtering in stoptimesForPatterns for route gtfsId
export default Relay.createContainer(FavouriteRouteListContainer, {
  fragments: {
    routes: () => Relay.QL`
      fragment on Route @relay(plural:true) {
        ${RouteAlertsQuery}
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
