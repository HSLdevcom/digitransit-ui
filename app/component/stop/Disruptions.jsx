import React from 'react';
import { useIntl } from 'react-intl';
import { uniq } from 'lodash';
import groupBy from 'lodash/groupBy';
import { useFragment } from 'react-relay';
import { DateTime } from 'luxon';
import DisruptionList from '../DisruptionList';
import {
  getAlertsForObject,
  getServiceAlertsForStation,
  getUniqueAlerts,
} from '../../../utils/client/alertUtils';
import { getRouteMode } from '../../../utils/client/modeUtils';
import {
  getStartTime,
  convertTo24HourFormat,
} from '../../../utils/client/timeUtils';
import { stopShape, stationShape } from '../../../utils/client/shapes';
import {
  AlertSeverityLevelType,
  AlertEntityType,
} from '../../../utils/shared/constants';
import { DisruptionsFragment } from './queries/DisruptionsFragment';
import { patternTextWithIcon } from '../routepage/RoutePatternSelect';
import { useConfigContext } from '../../client/ConfigContext';

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

export const filterCanceledCalls = (canceledCalls, relevantStopIds) =>
  canceledCalls.filter(
    ({ stopCall, tripOnServiceDate }) =>
      relevantStopIds.includes(stopCall.stopLocation.gtfsId) &&
      !relevantStopIds.includes(
        tripOnServiceDate.trip.pattern.stops.at(-1).gtfsId,
      ),
  );

const getCancelations = (stop, intl, config) => {
  if (!stop.canceledCalls) {
    return [];
  }
  const relevantStopIds = stop.stops
    ? stop.stops.map(({ gtfsId }) => gtfsId)
    : [stop.gtfsId];
  // group by pattern id to make individual disruption objects for each
  const canceledCallsByRoute = groupBy(
    // filter out calls from trips that are not departing from the focused stop or its children
    filterCanceledCalls(stop.canceledCalls, relevantStopIds),
    ({ tripOnServiceDate }) =>
      tripOnServiceDate.trip.pattern.code + tripOnServiceDate.serviceDate,
  );

  return Object.entries(canceledCallsByRoute).map(([tripId, canceledCalls]) => {
    const canceledDepartures = canceledCalls
      .map(
        ({
          stopCall: {
            schedule: {
              time: { departure },
            },
          },
        }) => ({
          scheduledDeparture:
            (DateTime.fromISO(departure) -
              DateTime.fromISO(departure).startOf('day')) /
            1000,
        }),
      )
      .sort((a, b) => a.scheduledDeparture - b.scheduledDeparture);
    const { trip, serviceDate } = canceledCalls[0].tripOnServiceDate;
    return {
      alertDescriptionText: intl.formatMessage(
        { id: 'generic-cancelation' },
        {
          mode: intl.formatMessage({ id: getRouteMode(trip.route, config) }),
          route: trip.route.shortName,
          headsign: trip.tripHeadsign,
          times: canceledDepartures
            .map(st =>
              convertTo24HourFormat(getStartTime(st.scheduledDeparture)),
            )
            .join(', '),
        },
      ),

      id: tripId,
      alertHeaderText: patternTextWithIcon(trip.pattern),
      canceledDepartures,
      entities: [
        {
          ...trip.route,
          code: trip.pattern.code,
          __typename: 'Route',
        },
      ],
      alertSeverityLevel: AlertSeverityLevelType.Warning,
      alertEffect: 'CANCELLATION',
      effectiveStartDate: DateTime.fromISO(serviceDate).toSeconds(),
      effectiveEndDate: DateTime.fromISO(serviceDate)
        .plus({ days: 1 })
        .toSeconds(),
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
  const ref = stopRef ?? stationRef;
  const config = useConfigContext();
  const stop = useFragment(DisruptionsFragment, ref);
  const intl = useIntl();
  const cancelations = getCancelations(stop, intl, config);
  const serviceAlerts = getAlerts(stop);
  return (
    <DisruptionList cancelations={cancelations} serviceAlerts={serviceAlerts} />
  );
}

Disruptions.propTypes = { stop: stopShape, station: stationShape };

export default Disruptions;
