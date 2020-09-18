import cx from 'classnames';
import connectToStores from 'fluxible-addons-react/connectToStores';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import ComponentUsageExample from './ComponentUsageExample';
import RouteAlertsRow from './RouteAlertsRow';
import { createUniqueAlertList } from '../util/alertUtils';
import { AlertSeverityLevelType } from '../constants';

const AlertList = ({
  cancelations,
  currentTime,
  disableScrolling,
  showExpired,
  serviceAlerts,
  showRouteNameLink,
}) => {
  const groupedAlerts =
    createUniqueAlertList(
      serviceAlerts,
      cancelations,
      currentTime,
      showExpired,
    ) || [];

  if (groupedAlerts.length === 0) {
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
    <div className={cx({ 'momentum-scroll': !disableScrolling })}>
      <div className="route-alerts-list">
        {groupedAlerts.map(
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
              showRouteNameLink={showRouteNameLink}
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
  showRouteNameLink: PropTypes.bool,
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
