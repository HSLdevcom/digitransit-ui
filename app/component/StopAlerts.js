import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import { intlShape } from 'react-intl';
import { uniq } from 'lodash';

import AlertList from './AlertList';
import {
  getCancelationsForStop,
  getAlertsForObject,
  getServiceAlertsForStation,
} from '../util/alertUtils';
import { getRouteMode } from '../util/modeUtils';
import { alertShape } from '../util/shapes';
import { AlertSeverityLevelType, AlertEntityType } from '../constants';

export const isRelevantEntity = (entity, stopIds, routeIds) =>
  // eslint-disable-next-line no-underscore-dangle
  (entity.__typename === AlertEntityType.Stop &&
    stopIds.includes(entity.gtfsId)) ||
  // eslint-disable-next-line no-underscore-dangle
  (entity.__typename === AlertEntityType.Route &&
    routeIds.includes(entity.gtfsId));

export const getRouteIdsForStop = stop =>
  uniq(stop?.routes.map(route => route.gtfsId));

export const filterAlertEntities = (stop, alerts) => {
  const alertsToFilter = [...alerts];
  const isStation = stop.locationType === 'STATION';
  const routeIds = isStation
    ? stop.stops.flatMap(stationStop => getRouteIdsForStop(stationStop))
    : getRouteIdsForStop(stop);
  const stopIds = isStation
    ? stop.stops.map(stationStop => stationStop.gtfsId)
    : [stop.gtfsId];
  return alertsToFilter
    .map(alert => {
      return {
        ...alert,
        entities: alert.entities.filter(entity =>
          isRelevantEntity(entity, stopIds, routeIds),
        ),
      };
    })
    .filter(alert => alert.entities.length > 0);
};

export const getUniqueAlerts = alerts => {
  return uniq(alerts.map(alert => JSON.stringify(alert))).map(alert =>
    JSON.parse(alert),
  );
};

/**
 * This returns the canceled stoptimes mapped as alerts for the stoptimes'
 * routes.
 */
export const getCancelations = (stop, intl) => {
  return getCancelationsForStop(stop).map(stoptime => {
    const { color, mode, shortName, gtfsId, type } = stoptime.trip.route;
    const entity = {
      __typename: AlertEntityType.Route,
      color,
      type,
      mode,
      shortName,
      gtfsId,
    };
    const departureTime = stoptime.serviceDay + stoptime.scheduledDeparture;
    const translatedMode = intl.formatMessage({
      id: getRouteMode(stoptime.trip.route).toLowerCase(),
    });
    return {
      alertDescriptionText: intl.formatMessage(
        { id: 'generic-cancelation' },
        {
          mode: translatedMode,
          route: shortName,
          headsign: stoptime.headsign || stoptime.trip.tripHeadsign,
          time: moment.unix(departureTime).format('HH:mm'),
        },
      ),
      entities: [entity],
      alertSeverityLevel: AlertSeverityLevelType.Warning,
    };
  });
};

/**
 * @param {Object.<string,*>} stop
 * @returns {Array.<Object>}
 */
export const getAlerts = stop => {
  const isStation = stop.locationType === 'STATION';
  return getUniqueAlerts(
    filterAlertEntities(
      stop,
      isStation ? getServiceAlertsForStation(stop) : getAlertsForObject(stop),
    ),
  );
};

const StopAlerts = ({ stop }, { intl }) => {
  const cancelations = getCancelations(stop, intl);
  const serviceAlerts = getAlerts(stop);

  return (
    <AlertList
      showLinks={false}
      cancelations={cancelations}
      serviceAlerts={serviceAlerts}
    />
  );
};

StopAlerts.propTypes = {
  stop: PropTypes.shape({
    gtfsId: PropTypes.string.isRequired,
    locationType: PropTypes.string.isRequired,
    routes: PropTypes.arrayOf(
      PropTypes.shape({
        gtfsId: PropTypes.string.isRequired,
      }),
    ),
    alerts: PropTypes.arrayOf(alertShape).isRequired,
    stops: PropTypes.arrayOf(
      PropTypes.shape({
        gtfsId: PropTypes.string.isRequired,
        routes: PropTypes.arrayOf(
          PropTypes.shape({
            gtfsId: PropTypes.string.isRequired,
          }),
        ).isRequired,
        alerts: PropTypes.arrayOf(alertShape).isRequired,
      }),
    ),
    stoptimes: PropTypes.arrayOf(
      PropTypes.shape({
        headsign: PropTypes.string,
        realtimeState: PropTypes.string,
        scheduledDeparture: PropTypes.number,
        serviceDay: PropTypes.number,
        trip: PropTypes.shape({
          tripHeadsign: PropTypes.string.isRequired,
          route: PropTypes.shape({
            gtfsId: PropTypes.string.isRequired,
            color: PropTypes.string,
            mode: PropTypes.string.isRequired,
            shortName: PropTypes.string.isRequired,
            type: PropTypes.number,
          }).isRequired,
        }).isRequired,
      }),
    ).isRequired,
  }).isRequired,
};

StopAlerts.contextTypes = {
  intl: intlShape,
};

export default StopAlerts;
