import React from 'react';
import { useIntl } from 'react-intl';
import { uniq } from 'lodash';
import { useFragment } from 'react-relay';
import DisruptionList from '../DisruptionList';
import {
  getCancelationsForStop,
  getAlertsForObject,
  getServiceAlertsForStation,
  getUniqueAlerts,
} from '../../../utils/client/alertUtils';
import { getRouteMode } from '../../../utils/client/modeUtils';
import { epochToTime } from '../../../utils/client/timeUtils';
import { stopShape, stationShape } from '../../../utils/client/shapes';
import {
  AlertSeverityLevelType,
  AlertEntityType,
} from '../../../utils/shared/constants';
import { useConfigContext } from '../../client/ConfigContext';
import { DisruptionsFragment } from './queries/DisruptionsFragment';

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

/**
 * This returns the canceled stoptimes mapped as alerts for the stoptimes'
 * routes.
 */
export const getCancelations = (stop, intl, config) => {
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
      id: getRouteMode(stoptime.trip.route),
    });
    return {
      alertDescriptionText: intl.formatMessage(
        { id: 'generic-cancelation' },
        {
          mode: translatedMode,
          route: shortName,
          headsign: stoptime.headsign || stoptime.trip.tripHeadsign,
          time: epochToTime(departureTime * 1000, config),
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

function Disruptions({ stop: stopRef, station: stationRef }) {
  const intl = useIntl();
  const config = useConfigContext();
  const ref = stopRef ?? stationRef;
  const stop = useFragment(DisruptionsFragment, ref);
  const cancelations = getCancelations(stop, intl, config);
  const serviceAlerts = getAlerts(stop);

  return (
    <DisruptionList
      showLinks={false}
      cancelations={cancelations}
      serviceAlerts={serviceAlerts}
    />
  );
}

Disruptions.propTypes = { stop: stopShape, station: stationShape };

export default Disruptions;
