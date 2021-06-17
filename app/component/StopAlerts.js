import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import AlertList from './AlertList';
import DepartureCancelationInfo from './DepartureCancelationInfo';
import {
  getCancelationsForStop,
  getServiceAlertsForStop,
  otpServiceAlertShape,
  getServiceAlertsForStopRoutes,
  getServiceAlertsForTerminalStops,
  routeHasServiceAlert,
  getServiceAlertsForRoute,
  routeHasCancelation,
  getCancelationsForRoute,
} from '../util/alertUtils';

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

  const serviceAlertsForRoutes = [];
  const disruptionsForRoutes = [];

  if (stop.routes) {
    stop.routes.forEach(
      route =>
        routeHasServiceAlert(route) &&
        serviceAlertsForRoutes.push(
          ...getServiceAlertsForRoute(route, route.gtfsId, intl.locale),
        ) &&
        routeHasCancelation(route) &&
        disruptionsForRoutes.push(
          ...getCancelationsForRoute(route, route.gtfsId, intl.locale),
        ),
    );
  }

  const isTerminal = !stop.code;
  const serviceAlerts = [
    // Alerts for terminal's stops.
    ...getServiceAlertsForTerminalStops(isTerminal, stop, intl.locale),
    ...getServiceAlertsForStop(stop, intl.locale),
    ...getServiceAlertsForStopRoutes(stop, intl.locale),
    ...serviceAlertsForRoutes,
    ...disruptionsForRoutes,
  ];

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
    routes: PropTypes.array,
    alerts: PropTypes.arrayOf(otpServiceAlertShape).isRequired,
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
            alerts: PropTypes.arrayOf(otpServiceAlertShape).isRequired,
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
