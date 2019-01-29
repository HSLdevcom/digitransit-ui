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
const DEFAULT_VALIDITY = 5 * 60 * 1000;

const AlertList = props => {
  const { cancelations, currentTime, serviceAlerts } = props;
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

  const hasExpired = validityPeriod =>
    validityPeriod.startTime < currentTime ||
    (validityPeriod.endTime || validityPeriod.startTime + DEFAULT_VALIDITY) >
      currentTime;

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
          .map(alert => {
            const { color, mode, shortName } = alert.route;
            return (
              <RouteAlertsRow
                color={color ? `#${color}` : null}
                description={alert.description}
                expired={hasExpired(alert.validityPeriod)}
                header={alert.header}
                key={uniqueId('alert-')}
                routeLine={shortName}
                routeMode={mode.toLowerCase()}
              />
            );
          })}
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
  }).isRequired,
  validityPeriod: PropTypes.shape({
    startTime: PropTypes.number.isRequired,
    endTime: PropTypes.number,
  }).isRequired,
});

AlertList.propTypes = {
  currentTime: PropTypes.oneOfType([PropTypes.object, PropTypes.number])
    .isRequired,
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
