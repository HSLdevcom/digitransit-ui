import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { matchShape } from 'found';

import AlertList from './AlertList';
import DepartureCancelationInfo from './DepartureCancelationInfo';
import {
  getAlertsForObject,
  tripHasCancelation,
  setEntityForAlert,
} from '../util/alertUtils';
import { getRouteMode } from '../util/modeUtils';
import { ServiceAlertShape } from '../util/shapes';

function RouteAlertsContainer({ route }, { match }) {
  const { shortName } = route;
  const { patternId } = match.params;
  const cancelations = route.patterns
    .filter(pattern => pattern.code === patternId)
    .map(pattern => pattern.trips.filter(tripHasCancelation))
    .reduce((a, b) => a.concat(b), [])
    .map(trip => {
      const first = trip.stoptimes[0];
      const departureTime = first.serviceDay + first.scheduledDeparture;
      const last = trip.stoptimes[trip.stoptimes.length - 1];
      return {
        header: (
          <DepartureCancelationInfo
            firstStopName={first.stop.name}
            headsign={first.headsign || trip.tripHeadsign}
            routeMode={getRouteMode(route)}
            scheduledDepartureTime={departureTime}
            shortName={shortName}
          />
        ),
        route: {
          ...route,
        },
        effectiveStartDate: departureTime,
        effectiveEndDate: last.serviceDay + last.scheduledArrival,
      };
    });

  const entity = {
    __typename: 'Route',
    color: route.color,
    type: route.type,
    mode: route.mode,
    shortName: route.shortName,
    gtfsId: route.gtfsId,
  };
  const serviceAlerts = getAlertsForObject(route).map(alert =>
    // We display all alerts as they would for route in this view
    setEntityForAlert(alert, entity),
  );

  return (
    <AlertList
      showLinks={false}
      cancelations={cancelations}
      serviceAlerts={serviceAlerts}
    />
  );
}

RouteAlertsContainer.propTypes = {
  route: PropTypes.shape({
    alerts: PropTypes.arrayOf(ServiceAlertShape).isRequired,
    color: PropTypes.string,
    type: PropTypes.number,
    mode: PropTypes.string.isRequired,
    shortName: PropTypes.string.isRequired,
    gtfsId: PropTypes.string.isRequired,
    patterns: PropTypes.arrayOf(
      PropTypes.shape({
        code: PropTypes.string,
        stops: PropTypes.arrayOf(
          PropTypes.shape({
            alerts: PropTypes.arrayOf(ServiceAlertShape).isRequired,
          }),
        ),
        trips: PropTypes.arrayOf(
          PropTypes.shape({
            tripHeadsign: PropTypes.string,
            stoptimes: PropTypes.arrayOf(
              PropTypes.shape({
                headsign: PropTypes.string,
                realtimeState: PropTypes.string,
                scheduledDeparture: PropTypes.number,
                serviceDay: PropTypes.number,
                stop: PropTypes.shape({
                  name: PropTypes.string,
                }).isRequired,
              }),
            ).isRequired,
          }),
        ).isRequired,
      }),
    ).isRequired,
  }).isRequired,
};

RouteAlertsContainer.contextTypes = {
  match: matchShape,
};

const containerComponent = createFragmentContainer(RouteAlertsContainer, {
  route: graphql`
    fragment RouteAlertsContainer_route on Route
    @argumentDefinitions(date: { type: "String" }) {
      color
      mode
      type
      shortName
      gtfsId
      alerts(types: [ROUTE, STOPS_ON_ROUTE]) {
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
            name
            code
            vehicleMode
            gtfsId
          }
        }
      }
      patterns {
        trips: tripsForDate(serviceDate: $date) {
          tripHeadsign
          stoptimes: stoptimesForDate(serviceDate: $date) {
            headsign
            realtimeState
            scheduledArrival
            scheduledDeparture
            serviceDay
            stop {
              name
            }
          }
        }
      }
    }
  `,
});

export { containerComponent as default, RouteAlertsContainer as Component };
