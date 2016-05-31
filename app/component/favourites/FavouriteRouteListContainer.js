import React from 'react';
import Relay from 'react-relay';
import NextDeparturesList, {
   relayFragment as NextDeparturesListRelayFragment,
} from '../departure/NextDeparturesList';
import NoPositionPanel from '../front-page/no-position-panel';

import { getDistanceToNearestStop } from '../../util/geo-utils';

import connectToStores from 'fluxible-addons-react/connectToStores';

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

function FavouriteRouteListContainer({ location, currentTime, searching, routes }) {
  if (location) {
    return (
      <NextDeparturesList
        departures={getNextDepartures(routes, location.lat, location.lon)}
        currentTime={currentTime.unix()}
      />
    );
  } else if (searching) {
    return <div className="spinner-loader" />;
  }
  return <NoPositionPanel />;
}

FavouriteRouteListContainer.propTypes = {
  routes: React.PropTypes.array,
  currentTime: React.PropTypes.object,
  searching: React.PropTypes.bool,
  location: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.bool]).isRequired,
};

// TODO: This should be moved above in the component hierarchy
const FavouriteRouteListContainerWithTime = connectToStores(
  FavouriteRouteListContainer,
  ['TimeStore'],
  context => {
    const PositionStore = context.getStore('PositionStore');
    const position = PositionStore.getLocationState();
    const origin = context.getStore('EndpointStore').getOrigin();
    const positionOrFalse = position.hasLocation ? position : false;

    return {
      currentTime: context.getStore('TimeStore').getCurrentTime(),
      searching: position.status === PositionStore.STATUS_SEARCHING_LOCATION,
      location: origin.useCurrentPosition ? positionOrFalse : origin,
    };
  }
);


// TODO: Add filtering in stoptimesForPatterns for route gtfsId
export default Relay.createContainer(FavouriteRouteListContainerWithTime, {
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
