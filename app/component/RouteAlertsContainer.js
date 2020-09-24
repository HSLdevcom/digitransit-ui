import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { intlShape } from 'react-intl';

import AlertList from './AlertList';
import DepartureCancelationInfo from './DepartureCancelationInfo';
import { DATE_FORMAT } from '../constants';
import {
  RouteAlertsWithContentQuery,
  StopAlertsWithContentQuery,
} from '../util/alertQueries';
import {
  getServiceAlertsForRoute,
  getServiceAlertsForRouteStops,
  otpServiceAlertShape,
  tripHasCancelation,
} from '../util/alertUtils';

function RouteAlertsContainer({ route, patternId }, { intl }) {
  const { color, mode, shortName } = route;

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
            routeMode={mode}
            scheduledDepartureTime={departureTime}
            shortName={shortName}
          />
        ),
        route: {
          color,
          mode,
          shortName,
        },
        validityPeriod: {
          startTime: departureTime,
          endTime: last.serviceDay + last.scheduledArrival,
        },
      };
    });
  const serviceAlerts = [
    ...getServiceAlertsForRoute(route, patternId, intl.locale),
    ...getServiceAlertsForRouteStops(route, patternId, intl.locale),
  ];

  return (
    <AlertList
      showRouteNameLink={false}
      cancelations={cancelations}
      serviceAlerts={serviceAlerts}
    />
  );
}

RouteAlertsContainer.propTypes = {
  patternId: PropTypes.string,
  route: PropTypes.shape({
    alerts: PropTypes.arrayOf(otpServiceAlertShape).isRequired,
    color: PropTypes.string,
    mode: PropTypes.string.isRequired,
    shortName: PropTypes.string.isRequired,
    patterns: PropTypes.arrayOf(
      PropTypes.shape({
        code: PropTypes.string,
        stops: PropTypes.arrayOf(
          PropTypes.shape({
            alerts: PropTypes.arrayOf(otpServiceAlertShape).isRequired,
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

RouteAlertsContainer.defaultProps = {
  patternId: undefined,
};

RouteAlertsContainer.contextTypes = {
  intl: intlShape,
};

const containerComponent = Relay.createContainer(RouteAlertsContainer, {
  fragments: {
    route: () => Relay.QL`
      fragment on Route {
        color
        mode
        shortName
        ${RouteAlertsWithContentQuery}
        patterns {
          code
          stops {
            ${StopAlertsWithContentQuery}
          }
          trips: tripsForDate(serviceDate: $serviceDay) {
            tripHeadsign
            stoptimes: stoptimesForDate(serviceDate: $serviceDay) {
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
  initialVariables: {
    serviceDay: moment().format(DATE_FORMAT),
  },
});

export { containerComponent as default, RouteAlertsContainer as Component };
