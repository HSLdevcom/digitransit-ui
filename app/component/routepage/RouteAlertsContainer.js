import PropTypes from 'prop-types';
import connectToStores from 'fluxible-addons-react/connectToStores';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { useIntl } from 'react-intl';
import DisruptionList from '../DisruptionList';
import { useConfigContext } from '../../configurations/ConfigContext';
import {
  getAlertsForObject,
  tripHasCancelation,
  setEntityForAlert,
} from '../../util/alertUtils';
import { alertShape } from '../../util/shapes';
import { getStartTimeWithColon } from '../../util/timeUtils';
import { AlertSeverityLevelType, AlertEntityType } from '../../constants';
import { patternTextWithIcon } from './RoutePatternSelect';

const getCancelations = (
  route,
  entity,
  pattern,
  intl,
  currentTime,
  validityPeriod,
) => {
  const canceledDepartures = pattern.trips
    .filter(trip => tripHasCancelation(trip, currentTime, validityPeriod))
    .reduce((a, b) => a.concat(b), [])
    .sort(
      (a, b) =>
        a.stoptimes[0].serviceDay +
        a.stoptimes[0].scheduledDeparture -
        (b.stoptimes[0].serviceDay + b.stoptimes[0].scheduledDeparture),
    )
    .map(trip => trip.stoptimes[0]);

  return canceledDepartures.length
    ? [
        {
          alertDescriptionText: intl.formatMessage(
            { id: 'generic-cancelation' },
            {
              mode: route.mode,
              route: route.shortName,
              headsign: canceledDepartures[0].headsign,
              times: canceledDepartures
                .map(st => getStartTimeWithColon(st.scheduledDeparture))
                .join(', '),
            },
          ),
          id: `cancelations_${pattern.gtfsId}`,
          alertHeaderText: patternTextWithIcon(pattern),
          canceledDepartures,
          entities: [entity],
          alertSeverityLevel: AlertSeverityLevelType.Warning,
          effectiveStartDate: canceledDepartures[0].serviceDay,
          effectiveEndDate: canceledDepartures[0].serviceDay + 24 * 60 * 60,
        },
      ]
    : [];
};

function RouteAlertsContainer({ currentTime, route, pattern }) {
  const intl = useIntl();
  const config = useConfigContext();
  if (!route) {
    return null;
  }
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
  );

  const serviceAlerts = getAlertsForObject(pattern).map(alert =>
    // We display all alerts as they would be for the route in this view
    setEntityForAlert(alert, entity),
  );

  return (
    <div
      id="route-disruption-panel"
      className="route-disruption-panel"
      role="tabpanel"
      aria-labelledby="route-disruption-tab"
    >
      <DisruptionList
        cancelations={cancelations}
        serviceAlerts={serviceAlerts}
      />
    </div>
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
        stops {
          name
        }
        alerts(types: [ROUTE, STOPS_ON_PATTERN]) {
          id
          alertDescriptionText
          alertHash
          alertHeaderText
          alertEffect
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
              locationType
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
