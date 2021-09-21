import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import StopNearYou from './StopNearYou';

const PrioritizedStopsNearYou = ({ stops, currentTime, relay }) => {
  useEffect(() => {
    relay.refetch(oldVariables => {
      return { ...oldVariables, startTime: currentTime };
    });
  }, [currentTime]);
  return stops.map(stop => {
    return (
      <StopNearYou key={stop.gtfsId} stop={stop} currentTime={currentTime} />
    );
  });
};

PrioritizedStopsNearYou.propTypes = {
  stops: PropTypes.arrayOf(PropTypes.any).isRequired,
  currentTime: PropTypes.number.isRequired,
  relay: PropTypes.shape({
    refetch: PropTypes.func.isRequired,
  }).isRequired,
};

const connectedContainer = connectToStores(
  PrioritizedStopsNearYou,
  ['TimeStore'],
  ({ getStore }) => ({
    currentTime: getStore('TimeStore').getCurrentTime().unix(),
  }),
);

const containerComponent = createRefetchContainer(
  connectedContainer,
  {
    stops: graphql`
      fragment PrioritizedStopsNearYou_stops on Stop
      @relay(plural: true)
      @argumentDefinitions(startTime: { type: "Long!", defaultValue: 0 }) {
        id
        name
        gtfsId
        code
        desc
        lat
        lon
        zoneId
        platformCode
        vehicleMode
        stoptimesWithoutPatterns(startTime: $startTime, omitNonPickups: true) {
          scheduledArrival
          realtimeArrival
          arrivalDelay
          scheduledDeparture
          realtimeDeparture
          departureDelay
          realtime
          realtimeState
          serviceDay
          headsign
          trip {
            route {
              shortName
              longName
              gtfsId
              mode
              color
              patterns {
                headsign
              }
            }
          }
        }
      }
    `,
  },
  graphql`
    query PrioritizedStopsNearYouRefetchQuery(
      $stopIds: [String!]!
      $startTime: Long!
    ) {
      stops: stops(ids: $stopIds) {
        ...PrioritizedStopsNearYou_stops @arguments(startTime: $startTime)
      }
    }
  `,
);

export { containerComponent as default, PrioritizedStopsNearYou as Component };
