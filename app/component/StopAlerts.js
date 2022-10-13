import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import AlertList from './AlertList';
import DepartureCancelationInfo from './DepartureCancelationInfo';
import {
  getCancelationsForStop,
  getServiceAlertsForStop,
  getServiceAlertsForStopRoutes,
  getServiceAlertsForTerminalStops,
  routeHasServiceAlert,
  getServiceAlertsForRoute,
} from '../util/alertUtils';
import { ServiceAlertShape } from '../util/shapes';

/**
 * @param {Object.<string,*>} stop
 * @param {Object.<string,*>} intl
 * @returns {Array.<Object>}
 */
export const findCancellationsAndServiceAlerts = (stop, locale) => {
  const serviceAlertsForRoutes = [];

  if (stop.routes) {
    stop.routes.forEach(route => {
      route.patterns.forEach(pattern => {
        if (routeHasServiceAlert(route)) {
          serviceAlertsForRoutes.push(
            ...getServiceAlertsForRoute(route, pattern.code, locale),
          );
        }
      });
    });
  }

  const isTerminal = !stop.code;
  return [
    // Alerts for terminal's stops.
    ...getServiceAlertsForTerminalStops(isTerminal, stop, locale),
    ...getServiceAlertsForStop(stop, locale),
    ...getServiceAlertsForStopRoutes(stop, locale),
    ...serviceAlertsForRoutes,
  ];
};

const StopAlerts = ({ stop }, { intl }) => {
  const cancelations = getCancelationsForStop(stop).map(stoptime => {
    const { color, mode, shortName } = stoptime.trip.route;
    const departureTime = stoptime.serviceDay + stoptime.scheduledDeparture;
    return {
      header: (
        <DepartureCancelationInfo
          firstStopName={stoptime.trip.stops[0].name}
          headsign={stoptime.headsign}
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
      },
    };
  });

  const serviceAlerts = findCancellationsAndServiceAlerts(stop, intl.locale);

  return (
    <AlertList
      showRouteNameLink={false}
      cancelations={cancelations}
      serviceAlerts={serviceAlerts}
    />
  );
};

StopAlerts.propTypes = {
  stop: PropTypes.shape({
    name: PropTypes.string,
    code: PropTypes.string,
    routes: PropTypes.arrayOf(
      PropTypes.shape({
        gtfsId: PropTypes.string,
        mode: PropTypes.string,
        shortName: PropTypes.string,
        color: PropTypes.string,
        type: PropTypes.number,
      }),
    ).isRequired,
    alerts: PropTypes.arrayOf(ServiceAlertShape).isRequired,
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
            alerts: PropTypes.arrayOf(ServiceAlertShape).isRequired,
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

StopAlerts.contextTypes = {
  intl: intlShape.isRequired,
};

export default StopAlerts;
