import Relay from 'react-relay';
import NextDeparturesList, {
   relayFragment as NextDeparturesListRelayFragment,
} from '../departure/NextDeparturesList';
import config from '../../config';
import mapProps from 'recompose/mapProps';
const STOP_COUNT = 20;

function getNextDepartures(props) {
  const seenDepartures = {};
  const nodes = props.stops.stopsByRadius.edges.map(edge => edge.node);
  const nextDepartures = [];

  for (const stopAtDistance of nodes) {
    const keepStoptimes = [];

    if (stopAtDistance.stop.stoptimesForPatterns == null) { continue; }

    for (const patternAndStoptimes of stopAtDistance.stop.stoptimesForPatterns) {
      if (patternAndStoptimes.stoptimes.length === 0) { continue; }
      const pattern = patternAndStoptimes.pattern;

      const seenKey = `${pattern.route.gtfsId}:${pattern.headsign}`;
      const isSeen = seenDepartures[seenKey];
      const isModeIncluded = props.modes.includes(pattern.route.type);
      const isPickup = patternAndStoptimes.stoptimes[0].pickupType !== 'NONE';

      if (!isSeen && isModeIncluded && isPickup) {
        keepStoptimes.push(patternAndStoptimes);
        seenDepartures[seenKey] = true;
      }
    }

    for (const stoptime of keepStoptimes) {
      nextDepartures.push({
        distance: stopAtDistance.distance,
        stoptime,
        hasDisruption: stoptime.pattern.route.alerts.length > 0,
      });
    }
  }

  return nextDepartures;
}

const NearbyRouteListContainer = mapProps(props => ({
  departures: getNextDepartures(props),
  currentTime: parseInt(props.currentTime, 10),
}))(NextDeparturesList);

export default Relay.createContainer(NearbyRouteListContainer, {
  fragments: {
    stops: () => Relay.QL`
      fragment on QueryType {
        stopsByRadius(
          lat: $lat,
          lon: $lon,
          radius: $radius,
          agency: $agency,
          first: $numberOfStops
        ) {
          edges {
            node {
              distance
              stop {
                stoptimesForPatterns(
                  numberOfDepartures:2, startTime: $currentTime, timeRange: 7200
                ) {
                  ${NextDeparturesListRelayFragment}
                  pattern {
                    headsign
                    route {
                      gtfsId,
                      type,
                      alerts {
                        id
                      }
                    }
                  }
                  stoptimes { pickupType }
                }
              }
            }
          }
        }
      }
    `,
  },

  initialVariables: {
    lat: null,
    lon: null,
    radius: config.nearbyRoutes.radius,
    numberOfStops: STOP_COUNT,
    agency: config.preferredAgency,
    currentTime: '0',
  },
});
