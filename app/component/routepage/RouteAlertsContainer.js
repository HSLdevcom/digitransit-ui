import PropTypes from 'prop-types';
import connectToStores from 'fluxible-addons-react/connectToStores';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { intlShape } from 'react-intl';
import AlertList from '../AlertList';
import {
  getAlertsForObject,
  tripHasCancelation,
  setEntityForAlert,
} from '../../util/alertUtils';
import { getRouteMode } from '../../util/modeUtils';
import { alertShape } from '../../util/shapes';
import { epochToTime } from '../../util/timeUtils';
import { AlertSeverityLevelType, AlertEntityType } from '../../constants';

/**
 * This returns the trips mapped as alerts for the route.
 */
const getCancelations = (
  route,
  entity,
  pattern,
  intl,
  currentTime,
  validityPeriod,
  config,
) =>
  pattern.trips
    .filter(trip => tripHasCancelation(trip, currentTime, validityPeriod))
    .reduce((a, b) => a.concat(b), [])
    .sort(
      (a, b) =>
        a.stoptimes[0].serviceDay +
        a.stoptimes[0].scheduledDeparture -
        (b.stoptimes[0].serviceDay + b.stoptimes[0].scheduledDeparture),
    )
    .map(trip => {
      const first = trip.stoptimes[0];
      const departureTime = first.serviceDay + first.scheduledDeparture;
      const mode = intl.formatMessage({
        id: getRouteMode(route).toLowerCase(),
      });
      return {
        alertDescriptionText: intl.formatMessage(
          { id: 'generic-cancelation' },
          {
            mode,
            route: route.shortName,
            headsign: first.headsign || trip.tripHeadsign,
            time: epochToTime(departureTime * 1000, config),
          },
        ),
        entities: [entity],
        alertSeverityLevel: AlertSeverityLevelType.Warning,
      };
    });

function RouteAlertsContainer(
  { currentTime, route, pattern },
  { intl, config },
) {
  const entity = {
    __typename: AlertEntityType.Route,
    color: route.color,
    type: route.type,
    mode: route.mode,
    shortName: route.shortName,
    gtfsId: route.gtfsId,
  };
  const cancelations = getCancelations(
    route,
    entity,
    pattern,
    intl,
    currentTime,
    config.routeCancelationAlertValidity,
    config,
  );

  const serviceAlerts = getAlertsForObject(pattern).map(alert =>
    // We display all alerts as they would be for the route in this view
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
  currentTime: PropTypes.number.isRequired,
  route: PropTypes.shape({
    color: PropTypes.string,
    type: PropTypes.number,
    mode: PropTypes.string.isRequired,
    shortName: PropTypes.string.isRequired,
    gtfsId: PropTypes.string.isRequired,
  }).isRequired,
  pattern: PropTypes.shape({
    alerts: PropTypes.arrayOf(alertShape).isRequired,
    trips: PropTypes.arrayOf(
      PropTypes.shape({
        tripHeadsign: PropTypes.string,
        stoptimes: PropTypes.arrayOf(
          PropTypes.shape({
            headsign: PropTypes.string,
            realtimeState: PropTypes.string,
            scheduledDeparture: PropTypes.number.isRequired,
            serviceDay: PropTypes.number.isRequired,
            stop: PropTypes.shape({
              name: PropTypes.string,
            }).isRequired,
          }),
        ).isRequired,
      }),
    ).isRequired,
  }).isRequired,
};

RouteAlertsContainer.contextTypes = {
  intl: intlShape,
  config: PropTypes.shape({
    routeCancelationAlertValidity: PropTypes.shape({
      before: PropTypes.number,
      after: PropTypes.number,
    }),
  }).isRequired,
};

const containerComponent = createFragmentContainer(
  connectToStores(RouteAlertsContainer, ['TimeStore'], context => ({
    currentTime: context.getStore('TimeStore').getCurrentTime(),
  })),
  {
    route: graphql`
      fragment RouteAlertsContainer_route on Route {
        color
        mode
        type
        shortName
        gtfsId
      }
    `,
    pattern: graphql`
      fragment RouteAlertsContainer_pattern on Pattern
      @argumentDefinitions(date: { type: "String" }) {
        alerts(types: [ROUTE, STOPS_ON_PATTERN]) {
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
    `,
  },
);

export { containerComponent as default, RouteAlertsContainer as Component };
