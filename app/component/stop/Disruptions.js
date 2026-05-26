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
} from '../../util/alertUtils';
import { getRouteMode } from '../../util/modeUtils';
import { getStartTimeWithColon } from '../../util/timeUtils';
import { stopShape, stationShape } from '../../util/shapes';
import { AlertSeverityLevelType, AlertEntityType } from '../../constants';
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
        entities: (alert.entities || []).filter(entity =>
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
  const seenPatterns = new Set();
  const cancelations = getCancelationsForStop(stop).reduce((acc, stoptime) => {
    const { color, mode, shortName, gtfsId, type } = stoptime.trip.route;
    const entity = {
      __typename: AlertEntityType.Route,
      color,
      type,
      mode,
      shortName,
      gtfsId,
    };

    // if same pattern has multiple cancelations, consolidate into one alert
    if (seenPatterns.has(entity.shortName)) {
      const prevAlert = acc.find(
        element => element.entity.shortName === entity.shortName,
      );
      prevAlert.canceledDepartures.push(stoptime);
      return acc;
    }

    seenPatterns.add(entity.shortName);
    const translatedMode = intl.formatMessage({
      id: getRouteMode(stoptime.trip.route),
    });
    return [
      ...acc,
      {
        headsign: stoptime.headsign || stoptime.trip.tripHeadsign,
        canceledDepartures: [stoptime],
        entity,
        mode: translatedMode,
        route: shortName,
      },
    ];
  }, []);
  const cancelationsAsAlerts = cancelations.map(c => ({
    alertDescriptionText: intl.formatMessage(
      { id: 'generic-cancelation' },
      {
        mode: c.mode,
        route: c.route,
        headsign: c.headsign,
        times: c.canceledDepartures
          .map(st => getStartTimeWithColon(st.scheduledDeparture))
          .join(', '),
      },
    ),
    id: `cancelations_${c.route}`,
    alertHeaderText: c.headsign,
    canceledDepartures: c.canceledDepartures,
    entities: [c.entity],
    alertSeverityLevel: AlertSeverityLevelType.Warning,
    effectiveStartDate: c.canceledDepartures[0].serviceDay,
    effectiveEndDate: c.canceledDepartures[0].serviceDay + 24 * 60 * 60,
  }));
  return cancelationsAsAlerts;
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
  const ref = stopRef ?? stationRef;
  const stop = useFragment(DisruptionsFragment, ref);
  const intl = useIntl();
  const cancelations = getCancelations(stop, intl);
  const serviceAlerts = getAlerts(stop);

  return (
    <DisruptionList cancelations={cancelations} serviceAlerts={serviceAlerts} />
  );
}

Disruptions.propTypes = { stop: stopShape, station: stationShape };

export default Disruptions;
