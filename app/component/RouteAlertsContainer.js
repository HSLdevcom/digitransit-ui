import PropTypes from 'prop-types';
import connectToStores from 'fluxible-addons-react/connectToStores';
import React from 'react';
import moment from 'moment';
import { createFragmentContainer, graphql } from 'react-relay';
import { intlShape } from 'react-intl';
import { matchShape } from 'found';

import AlertList from './AlertList';
import {
  getAlertsForObject,
  tripHasCancelation,
  setEntityForAlert,
} from '../util/alertUtils';
import { getRouteMode } from '../util/modeUtils';
import { AlertShape } from '../util/shapes';
import { AlertSeverityLevelType } from '../constants';

/**
 * This returns the trips mapped as alerts for the route.
 */
const getCancelations = (
  route,
  entity,
  patternId,
  intl,
  currentTime,
  validityPeriod,
) =>
  route.patterns
    .filter(pattern => pattern.code === patternId)
    .map(pattern =>
      pattern.trips.filter(trip =>
        tripHasCancelation(trip, currentTime, validityPeriod),
      ),
    )
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
            time: moment.unix(departureTime).format('HH:mm'),
          },
        ),
        entities: [entity],
        alertSeverityLevel: AlertSeverityLevelType.Severe,
      };
    });

function RouteAlertsContainer({ currentTime, route }, { match, intl, config }) {
  const { patternId } = match.params;
  const entity = {
    __typename: 'Route',
    color: route.color,
    type: route.type,
    mode: route.mode,
    shortName: route.shortName,
    gtfsId: route.gtfsId,
  };
  const cancelations = getCancelations(
    route,
    entity,
    patternId,
    intl,
    currentTime,
    config.routeCancelationAlertValidity,
  );

  const serviceAlerts = getAlertsForObject(route).map(alert =>
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
    alerts: PropTypes.arrayOf(AlertShape).isRequired,
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
            alerts: PropTypes.arrayOf(AlertShape).isRequired,
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
    currentTime: context.getStore('TimeStore').getCurrentTime().unix(),
  })),
  {
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
          code
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
  },
);

export { containerComponent as default, RouteAlertsContainer as Component };
