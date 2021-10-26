/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import cx from 'classnames';
import connectToStores from 'fluxible-addons-react/connectToStores';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import RouteAlertsRow from './RouteAlertsRow';
import { createUniqueAlertList } from '../util/alertUtils';
import withBreakpoint from '../util/withBreakpoint';

const AlertList = ({
  cancelations,
  currentTime,
  disableScrolling,
  showExpired,
  serviceAlerts,
  showRouteNameLink,
  breakpoint,
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
      <div className="stop-no-alerts-container" tabIndex="0" aria-live="polite">
        <FormattedMessage
          id="disruption-info-no-alerts"
          defaultMessage="No known disruptions or diversions."
        />
      </div>
    );
  }

  return (
    <div className="route-alerts-content-wrapper">
      <div
        className={cx('route-alerts-list-wrapper', {
          'bp-large': breakpoint === 'large',
        })}
        aria-live="polite"
      >
        <div
          className={cx('route-alerts-list', {
            'momentum-scroll': !disableScrolling,
          })}
        >
          {groupedAlerts.map(
            (
              {
                description,
                expired,
                header,
                route: { color, mode, shortName, routeGtfsId } = {},
                severityLevel,
                stop: { code, vehicleMode, stopGtfsId, nameAndCode } = {},
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
                entityIdentifier={shortName || nameAndCode || code}
                entityMode={
                  (mode && mode.toLowerCase()) ||
                  (vehicleMode && vehicleMode.toLowerCase())
                }
                entityType={
                  (shortName && 'route') || ((nameAndCode || code) && 'stop')
                }
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
  breakpoint: PropTypes.string,
};

AlertList.defaultProps = {
  cancelations: [],
  disableScrolling: false,
  serviceAlerts: [],
  showExpired: false,
};

const connectedComponent = connectToStores(
  withBreakpoint(AlertList),
  ['TimeStore'],
  context => ({
    currentTime: context.getStore('TimeStore').getCurrentTime().unix(),
  }),
);

export { connectedComponent as default, AlertList as Component };
