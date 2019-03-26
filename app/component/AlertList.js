import connectToStores from 'fluxible-addons-react/connectToStores';
import uniqBy from 'lodash/uniqBy';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import ComponentUsageExample from './ComponentUsageExample';
import RouteAlertsRow from './RouteAlertsRow';
import { alertHasExpired } from '../util/alertUtils';
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
    return -1;
  }

  // sort by route information
  const routeOrder = routeNameCompare(a.route, b.route);
  if (routeOrder !== 0) {
    return routeOrder;
  }

  // sort by alert validity period
  return b.validityPeriod.startTime - a.validityPeriod.startTime;
};

const AlertList = ({
  cancelations,
  currentTime,
  showExpired,
  serviceAlerts,
}) => {
  const currentUnixTime = Number.isInteger(currentTime)
    ? currentTime
    : currentTime.unix();

  const alerts = (Array.isArray(cancelations) ? cancelations : [])
    .concat(Array.isArray(serviceAlerts) ? serviceAlerts : [])
    .map(alert => ({
      ...alert,
      expired: alertHasExpired(alert.validityPeriod, currentUnixTime),
    }))
    .filter(alert => (showExpired ? true : !alert.expired));

  if (alerts.length === 0) {
    return (
      <div className="stop-no-alerts-container">
        <FormattedMessage
          id="disruption-info-no-alerts"
          defaultMessage="No known disruptions or diversions."
        />
      </div>
    );
  }

  return (
    <div className="momentum-scroll">
      <div className="route-alerts-list">
        {uniqBy(
          alerts,
          alert =>
            `${alert.route && alert.route.shortName}_${alert.header}_${
              alert.description
            }`,
        )
          .sort(alertCompare)
          .map(
            ({
              description,
              header,
              expired,
              route: { color, mode, shortName } = {},
              severityLevel,
              validityPeriod: { startTime, endTime },
            }) => (
              <RouteAlertsRow
                color={color ? `#${color}` : null}
                description={description}
                expired={expired}
                header={header}
                key={`alert-${startTime}-${endTime}-${shortName}-${severityLevel}`}
                routeLine={shortName}
                routeMode={mode && mode.toLowerCase()}
                severityLevel={severityLevel}
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
  validityPeriod: PropTypes.shape({
    startTime: PropTypes.number.isRequired,
    endTime: PropTypes.number,
  }).isRequired,
});

AlertList.propTypes = {
  currentTime: PropTypes.oneOfType([
    PropTypes.shape({ unix: PropTypes.func.isRequired }),
    PropTypes.number,
  ]).isRequired,
  cancelations: PropTypes.arrayOf(alertShape),
  serviceAlerts: PropTypes.arrayOf(alertShape),
  showExpired: PropTypes.bool,
};

AlertList.defaultProps = {
  cancelations: [],
  serviceAlerts: [],
  showExpired: false,
};

AlertList.description = (
  <React.Fragment>
    <ComponentUsageExample>
      <AlertList
        currentTime={15}
        cancelations={[
          {
            header:
              'Bussin 3A lähtö Lentävänniemi–Etelä-Hervanta kello 10:49 on peruttu',
            route: {
              mode: 'BUS',
              shortName: '3A',
            },
            severityLevel: AlertSeverityLevelType.Warning,
            validityPeriod: { startTime: 20, endTime: 30 },
          },
          {
            header:
              'Bussin 28B lähtö Laatokantie–Ruutana kello 10:44 on peruttu',
            route: {
              mode: 'BUS',
              shortName: '28B',
            },
            severityLevel: AlertSeverityLevelType.Warning,
            validityPeriod: { startTime: 10, endTime: 20 },
          },
          {
            header:
              'Bussin 28B lähtö Laatokantie–Ruutana kello 10:25 on peruttu',
            route: {
              mode: 'BUS',
              shortName: '28B',
            },
            severityLevel: AlertSeverityLevelType.Warning,
            validityPeriod: { startTime: 1, endTime: 11 },
          },
          {
            header: 'Bussin 80 lähtö Moisio–Irjala kello 10:45 on peruttu',
            route: {
              mode: 'BUS',
              shortName: '80',
            },
            severityLevel: AlertSeverityLevelType.Warning,
            validityPeriod: { startTime: 11, endTime: 21 },
          },
          {
            header: 'Bussin 80 lähtö Moisio–Irjala kello 10:24 on peruttu',
            route: {
              mode: 'BUS',
              shortName: '80',
            },
            severityLevel: AlertSeverityLevelType.Warning,
            validityPeriod: { startTime: 0, endTime: 10 },
          },
        ]}
        serviceAlerts={[
          {
            header: 'Pysäkki Rantatie (1007) toistaiseksi pois käytöstä',
            description:
              'Pysäkki Rantatie (1007) toistaiseksi pois käytöstä työmaan vuoksi.',
            route: {},
            severityLevel: AlertSeverityLevelType.Warning,
            validityPeriod: { startTime: 10, endTime: 20 },
          },
          {
            header: 'Pysäkillä Rantatie (1007) lisävuoroja',
            description:
              'Pysäkillä Rantatie (1007) on lisävuoroja yleisötapahtuman vuoksi.',
            route: {},
            severityLevel: AlertSeverityLevelType.Info,
            validityPeriod: { startTime: 0, endTime: 10 },
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
    currentTime: context.getStore('TimeStore').getCurrentTime(),
  }),
);

export { connectedComponent as default, AlertList as Component };
