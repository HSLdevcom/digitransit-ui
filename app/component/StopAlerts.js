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
import { ServiceAlertShape } from '../util/shapes';
import { AlertSeverityLevelType } from '../constants';

export const isRelevantEntity = (entity, stopIds, routeIds) =>
  // eslint-disable-next-line no-underscore-dangle
  (entity.__typename === 'Stop' && stopIds.includes(entity.gtfsId)) ||
  // eslint-disable-next-line no-underscore-dangle
  (entity.__typename === 'Route' && routeIds.includes(entity.gtfsId));

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

/**
 * This returns the canceled stoptimes mapped as alerts for the stoptimes'
 * routes.
 */
export const getCancelations = (stop, intl) => {
  return getCancelationsForStop(stop).map(stoptime => {
    const { color, mode, shortName, gtfsId, type } = stoptime.trip.route;
    const entity = {
      __typename: 'Route',
      color,
      type,
      mode,
      shortName,
      gtfsId,
    };
    const departureTime = stoptime.serviceDay + stoptime.scheduledDeparture;
    return {
      alertDescriptionText: intl.formatMessage(
        { id: 'generic-cancelation' },
        {
          mode,
          route: shortName,
          headsign: stoptime.headsign || stoptime.trip.tripHeadsign,
          time: moment.unix(departureTime).format('HH:mm'),
        },
      ),
      entities: [entity],
      effectiveStartDate: departureTime - 3600, // 1h before departure
      effectiveEndDate: departureTime + 1800, // 30 minutes after departure
      alertSeverityLevel: AlertSeverityLevelType.Severe,
    };
  });
};

/**
 * @param {Object.<string,*>} stop
 * @returns {Array.<Object>}
 */
export const getAlerts = stop => {
  const isStation = stop.locationType === 'STATION';
  return filterAlertEntities(
    stop,
    isStation ? getServiceAlertsForStation(stop) : getAlertsForObject(stop),
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
  intl: intlShape,
};

export default StopAlerts;
