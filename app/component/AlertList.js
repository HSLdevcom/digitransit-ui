import connectToStores from 'fluxible-addons-react/connectToStores';
import uniqueId from 'lodash/uniqueId';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import RouteAlertsRow from './RouteAlertsRow';
import { routeNameCompare } from '../util/searchUtils';

/**
 * The default validity period (5 minutes) for an alert without a set end time.
 */
export const DEFAULT_VALIDITY = 5 * 60;

/**
 * Checks if the given validity period has expired or not.
 *
 * @param {*} validityPeriod the validity period to check.
 * @param {number} currentUnixTime the current time in unix timestamp seconds.
 * @param {number} defaultValidity the default validity period length in seconds.
 */
export const hasExpired = (
  validityPeriod,
  currentUnixTime,
  defaultValidity = DEFAULT_VALIDITY,
) =>
  (validityPeriod.endTime || validityPeriod.startTime + defaultValidity) <
  currentUnixTime;

const AlertList = ({ cancelations, currentTime, serviceAlerts }) => {
  const alerts = (Array.isArray(cancelations) ? cancelations : []).concat(
    Array.isArray(serviceAlerts) ? serviceAlerts : [],
  );

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

  const currentUnixTime = Number.isInteger(currentTime)
    ? currentTime
    : currentTime.unix();

  return (
    <div className="momentum-scroll">
      <div className="route-alerts-list">
        {alerts
          .sort((a, b) => {
            const order = routeNameCompare(a.route, b.route);
            return order === 0
              ? b.validityPeriod.startTime - a.validityPeriod.startTime
              : order;
          })
          .map(
            ({
              description,
              header,
              route: { color, mode, shortName } = {},
              severity,
              validityPeriod,
            }) => (
              <RouteAlertsRow
                color={color ? `#${color}` : null}
                description={description}
                expired={hasExpired(validityPeriod, currentUnixTime)}
                header={header}
                key={uniqueId('alert-')}
                routeLine={shortName}
                routeMode={mode && mode.toLowerCase()}
                severity={severity}
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
    mode: PropTypes.string.isRequired,
    shortName: PropTypes.string.isRequired,
  }),
  severity: PropTypes.string,
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
};

AlertList.defaultProps = {
  cancelations: [],
  serviceAlerts: [],
};

const connectedComponent = connectToStores(
  AlertList,
  ['TimeStore'],
  context => ({
    currentTime: context.getStore('TimeStore').getCurrentTime(),
  }),
);

export { connectedComponent as default, AlertList as Component };
