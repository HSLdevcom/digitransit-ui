import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { AlertShape } from '../util/shapes';

import StopAlerts from './StopAlerts';

const StopAlertsContainer = ({ stop }) => {
  return <StopAlerts stop={stop} />;
};

StopAlertsContainer.propTypes = {
  stop: PropTypes.shape({
    alerts: PropTypes.arrayOf(AlertShape).isRequired,
    stoptimes: PropTypes.arrayOf(
      PropTypes.shape({
        headsign: PropTypes.string.isRequired,
        realtimeState: PropTypes.string,
        scheduledDeparture: PropTypes.number,
        serviceDay: PropTypes.number,
        trip: PropTypes.shape({
          pattern: PropTypes.shape({
            code: PropTypes.string,
          }),
          route: PropTypes.shape({
            alerts: PropTypes.arrayOf(AlertShape).isRequired,
            color: PropTypes.string,
            mode: PropTypes.string.isRequired,
            shortName: PropTypes.string.isRequired,
          }).isRequired,
          stops: PropTypes.arrayOf(
            PropTypes.shape({
              name: PropTypes.string,
            }),
          ).isRequired,
        }).isRequired,
      }),
    ).isRequired,
  }).isRequired,
};

const containerComponent = createFragmentContainer(StopAlertsContainer, {
  stop: graphql`
    fragment StopAlertsContainer_stop on Stop
    @argumentDefinitions(
      startTime: { type: "Long" }
      timeRange: { type: "Int", defaultValue: 3600 }
    ) {
      routes {
        gtfsId
      }
      gtfsId
      locationType
      alerts(types: [STOP, ROUTES]) {
        id
        alertDescriptionText
        alertHash
        alertHeaderText
        alertSeverityLevel
        alertUrl
        effectiveEndDate
        effectiveStartDate
        entities {
          __typename
          ... on Route {
            color
            type
            mode
            shortName
            gtfsId
          }
          ... on Stop {
            gtfsId
          }
        }
      }
      stoptimes: stoptimesWithoutPatterns(
        startTime: $startTime
        timeRange: $timeRange
        numberOfDepartures: 100
        omitCanceled: false
      ) {
        serviceDay
        scheduledDeparture
        headsign
        realtimeState
        trip {
          tripHeadsign
          route {
            gtfsId
            type
            color
            mode
            shortName
          }
        }
      }
    }
  `,
});

export { containerComponent as default, StopAlertsContainer as Component };
