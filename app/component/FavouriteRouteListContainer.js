import Relay from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';

import NextDeparturesList, {
   relayFragment as NextDeparturesListRelayFragment,
} from './NextDeparturesList';
import { getDistanceToNearestStop } from '../util/geo-utils';


const getNextDepartures = (routes, lat, lon) => {
  const nextDepartures = [];
  const seenDepartures = {};

  for (const route of routes) {
    const hasDisruption = route.alerts.length > 0;

    for (const pattern of route.patterns) {
      const closest = getDistanceToNearestStop(lat, lon, pattern.stops);
      const keepStoptimes = [];

      for (const stoptime of closest.stop.stoptimes) {
        const seenKey = `${stoptime.pattern.route.gtfsId}:${stoptime.pattern.headsign}`;
        const isSeen = seenDepartures[seenKey];
        const isFavourite =
          stoptime.pattern.route.gtfsId === route.gtfsId &&
          stoptime.pattern.headsign === pattern.headsign;

        if (!isSeen && isFavourite) {
          keepStoptimes.push(stoptime);
          seenDepartures[seenKey] = true;
        }
      }

      for (const stoptime of keepStoptimes) {
        nextDepartures.push({
          distance: closest.distance,
          stoptime,
          hasDisruption,
        });
      }
    }
  }

  return nextDepartures;
};

// TODO: This should be moved above in the component hierarchy
const FavouriteRouteListContainer = connectToStores(
  NextDeparturesList,
  ['TimeStore'],
  (context, { routes }) => {
    const PositionStore = context.getStore('PositionStore');
    const position = PositionStore.getLocationState();
    const origin = context.getStore('EndpointStore').getOrigin();
    const location = origin.useCurrentPosition ? position : origin;

    return {
      currentTime: context.getStore('TimeStore').getCurrentTime().unix(),
      departures: getNextDepartures(routes, location.lat, location.lon),
    };
  }
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
              ${NextDeparturesListRelayFragment}
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
