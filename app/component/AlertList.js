import cx from 'classnames';
import connectToStores from 'fluxible-addons-react/connectToStores';
import isEmpty from 'lodash/isEmpty';
import groupBy from 'lodash/groupBy';
import uniqBy from 'lodash/uniqBy';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import ComponentUsageExample from './ComponentUsageExample';
import RouteAlertsRow from './RouteAlertsRow';
import { isAlertValid } from '../util/alertUtils';
import { routeNameCompare } from '../util/searchUtils';
import { AlertSeverityLevelType } from '../constants';

/**
 * Compares the given alerts in order to sort them.
 *
 * @param {*} a the first alert to compare.
 * @param {*} b the second alert to compare.
 */
export const alertCompare = (a, b) => {
  // sort by expiration status
  if (a.expired !== b.expired) {
    return a.expired ? 1 : -1;
  }

  // sort by missing route information (for stop level alerts)
  if (!a.route || !a.route.shortName) {
    // sort by stop information if it exists
    if (a.stop && b.stop) {
      return `${a.stop.code}`.localeCompare(`${b.stop.code}`);
    }
    return -1;
  }

  // sort by route information
  const routeOrder = routeNameCompare(a.route || {}, b.route || {});
  if (routeOrder !== 0) {
    return routeOrder;
  }

  // sort by alert validity period
  return b.validityPeriod.startTime - a.validityPeriod.startTime;
};

const hasRoute = alert => alert && !isEmpty(alert.route);
const hasStop = alert => alert && !isEmpty(alert.stop);

const AlertList = ({
  cancelations,
  currentTime,
  disableScrolling,
  showExpired,
  serviceAlerts,
}) => {
  const getRoute = alert => alert.route || {};
  const getMode = alert => getRoute(alert).mode;
  const getShortName = alert => getRoute(alert).shortName;
  const getRouteGtfsId = alert => getRoute(alert).gtfsId;

  const getStop = alert => alert.stop || {};
  const getVehicleMode = alert => getStop(alert).vehicleMode;
  const getCode = alert => getStop(alert).code;
  const getStopGtfsId = alert => getStop(alert).gtfsId;

  const getGroupKey = alert =>
    `${alert.severityLevel}${(hasRoute(alert) && `route_${getMode(alert)}`) ||
      (hasStop(alert) && `stop_${getVehicleMode(alert)}`)}${alert.header}${
      alert.description
    }`;
  const getUniqueId = alert =>
    `${getShortName(alert) || getCode(alert)}${getGroupKey(alert)}`;

  const uniqueAlerts = uniqBy(
    [
      ...(Array.isArray(cancelations)
        ? cancelations
            .map(cancelation => ({
              ...cancelation,
              severityLevel: AlertSeverityLevelType.Warning,
              expired: !isAlertValid(cancelation, currentTime, {
                isFutureValid: true,
              }),
            }))
            .filter(alert => (showExpired ? true : !alert.expired))
        : []),
      ...(Array.isArray(serviceAlerts)
        ? serviceAlerts
            .map(alert => ({
              ...alert,
              expired: !isAlertValid(alert, currentTime),
            }))
            .filter(alert => (showExpired ? true : !alert.expired))
        : []),
    ],
    getUniqueId,
  );

  if (uniqueAlerts.length === 0) {
    return (
      <div className="stop-no-alerts-container">
        <FormattedMessage
          id="disruption-info-no-alerts"
          defaultMessage="No known disruptions or diversions."
        />
      </div>
    );
  }

  const alertGroups = groupBy(uniqueAlerts, getGroupKey);
  const groupedAlerts = Object.keys(alertGroups).map(key => {
    const alerts = alertGroups[key];
    const alert = alerts[0];
    return {
      ...alert,
      route:
        (hasRoute(alert) && {
          mode: getMode(alert),
          routeGtfsId: alerts
            .sort(alertCompare)
            .map(getRouteGtfsId)
            .join(','),
          shortName: alerts
            .sort(alertCompare)
            .map(getShortName)
            .join(', '),
        }) ||
        undefined,
      stop:
        (hasStop(alert) && {
          stopGtfsId: alerts
            .sort(alertCompare)
            .map(getStopGtfsId)
            .join(','),
          code: alerts
            .sort(alertCompare)
            .map(getCode)
            .join(', '),
          vehicleMode: getVehicleMode(alert),
        }) ||
        undefined,
    };
  });
  return (
    <div className={cx({ 'momentum-scroll': !disableScrolling })}>
      <div className="route-alerts-list">
        {groupedAlerts
          .sort(alertCompare)
          .map(
            (
              {
                description,
                expired,
                header,
                route: { color, mode, shortName, routeGtfsId } = {},
                severityLevel,
                stop: { code, vehicleMode, stopGtfsId } = {},
                url,
                validityPeriod: { startTime, endTime },
              },
              i,
            ) => (
              <RouteAlertsRow
                color={color ? `#${color}` : null}
                currentTime={currentTime}
                description={description}
                endTime={endTime}
                entityIdentifier={shortName || code}
                entityMode={
                  (mode && mode.toLowerCase()) ||
                  (vehicleMode && vehicleMode.toLowerCase())
                }
                entityType={(shortName && 'route') || (code && 'stop')}
                expired={expired}
                header={header}
                key={`alert-${shortName}-${severityLevel}-${i}`} // eslint-disable-line react/no-array-index-key
                severityLevel={severityLevel}
                startTime={startTime}
                url={url}
                gtfsIds={routeGtfsId || stopGtfsId}
              />
            ),
          )}
      </div>
    </div>
  );
};

const alertShape = PropTypes.shape({
  description: PropTypes.string,
  header: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  route: PropTypes.shape({
    color: PropTypes.string,
    mode: PropTypes.string,
    shortName: PropTypes.string,
  }),
  severityLevel: PropTypes.string,
  stop: PropTypes.shape({
    code: PropTypes.string,
    vehicleMode: PropTypes.string,
  }),
  url: PropTypes.string,
  validityPeriod: PropTypes.shape({
    startTime: PropTypes.number.isRequired,
    endTime: PropTypes.number,
  }).isRequired,
});

AlertList.propTypes = {
  cancelations: PropTypes.arrayOf(alertShape),
  currentTime: PropTypes.PropTypes.number.isRequired,
  disableScrolling: PropTypes.bool,
  serviceAlerts: PropTypes.arrayOf(alertShape),
  showExpired: PropTypes.bool,
};

AlertList.defaultProps = {
  cancelations: [],
  disableScrolling: false,
  serviceAlerts: [],
  showExpired: false,
};

AlertList.description = (
  <React.Fragment>
    <ComponentUsageExample>
      <AlertList
        currentTime={1554719400}
        cancelations={[
          {
            header:
              'Bussin 3A lähtö Lentävänniemi–Etelä-Hervanta kello 10:49 on peruttu',
            route: {
              mode: 'BUS',
              shortName: '3A',
            },
            validityPeriod: { startTime: 1554719400 },
          },
          {
            header:
              'Bussin 28B lähtö Laatokantie–Ruutana kello 10:44 on peruttu',
            route: {
              mode: 'BUS',
              shortName: '28B',
            },
            validityPeriod: { startTime: 1554719400 },
          },
          {
            header:
              'Bussin 28B lähtö Laatokantie–Ruutana kello 10:25 on peruttu',
            route: {
              mode: 'BUS',
              shortName: '28B',
            },
            validityPeriod: { startTime: 1554719400 },
          },
          {
            header: 'Bussin 80 lähtö Moisio–Irjala kello 10:45 on peruttu',
            route: {
              mode: 'BUS',
              shortName: '80',
            },
            validityPeriod: { startTime: 1554719400 },
          },
          {
            header: 'Bussin 80 lähtö Moisio–Irjala kello 10:24 on peruttu',
            route: {
              mode: 'BUS',
              shortName: '80',
            },
            validityPeriod: { startTime: 1554719400 },
          },
        ]}
        serviceAlerts={[
          {
            header: 'Pysäkki Rantatie (1007) toistaiseksi pois käytöstä',
            description:
              'Pysäkki Rantatie (1007) toistaiseksi pois käytöstä työmaan vuoksi.',
            route: {},
            severityLevel: AlertSeverityLevelType.Warning,
            validityPeriod: { startTime: 1554718400, endTime: 1554728400 },
          },
          {
            header: 'Pysäkillä Rantatie (1007) lisävuoroja',
            description:
              'Pysäkillä Rantatie (1007) on lisävuoroja yleisötapahtuman vuoksi.',
            route: {},
            severityLevel: AlertSeverityLevelType.Info,
            validityPeriod: { startTime: 1554718400, endTime: 1554728400 },
          },
        ]}
      />
    </ComponentUsageExample>
    <ComponentUsageExample>
      <AlertList
        currentTime={1554718400}
        serviceAlerts={[
          {
            description:
              'Pasilansillan työmaa aiheuttaa viivästyksiä joukkoliikenteelle',
            route: { mode: 'BUS', shortName: '14' },
            severityLevel: AlertSeverityLevelType.Warning,
            validityPeriod: { startTime: 1564718400, endTime: 1568728400 },
          },
          {
            description:
              'Pasilansillan työmaa aiheuttaa viivästyksiä joukkoliikenteelle',
            route: { mode: 'BUS', shortName: '39B' },
            severityLevel: AlertSeverityLevelType.Warning,
            validityPeriod: { startTime: 1564718400, endTime: 1568728400 },
          },
          {
            description:
              'Pasilansillan työmaa aiheuttaa viivästyksiä joukkoliikenteelle',
            route: { mode: 'TRAM', shortName: '7' },
            severityLevel: AlertSeverityLevelType.Warning,
            validityPeriod: { startTime: 1564718400, endTime: 1568728400 },
          },
          {
            description:
              'Pasilansillan työmaa aiheuttaa viivästyksiä joukkoliikenteelle',
            route: { mode: 'TRAM', shortName: '9' },
            severityLevel: AlertSeverityLevelType.Warning,
            validityPeriod: { startTime: 1564718400, endTime: 1568728400 },
          },
        ]}
      />
    </ComponentUsageExample>
  </React.Fragment>
);

const connectedComponent = connectToStores(
  AlertList,
  ['TimeStore'],
  context => ({
    currentTime: context
      .getStore('TimeStore')
      .getCurrentTime()
      .unix(),
  }),
);

export { connectedComponent as default, AlertList as Component };
