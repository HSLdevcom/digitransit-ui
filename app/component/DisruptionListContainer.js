import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import Relay from 'react-relay/classic';

import AlertList from './AlertList';
import Icon from './Icon';
import { AlertContentQuery } from '../util/alertQueries';
import {
  getServiceAlertDescription,
  getServiceAlertHeader,
  getServiceAlertUrl,
} from '../util/alertUtils';
import { isKeyboardSelectionEvent } from '../util/browser';

const mapAlert = (alert, locale) => ({
  description: getServiceAlertDescription(alert, locale),
  header: getServiceAlertHeader(alert, locale),
  route: { ...alert.route },
  severityLevel: alert.alertSeverityLevel,
  stop: { ...alert.stop },
  url: getServiceAlertUrl(alert, locale),
  validityPeriod: {
    endTime: alert.effectiveEndDate,
    startTime: alert.effectiveStartDate,
  },
});

function DisruptionListContainer({ root }, { intl }) {
  if (!root || !root.alerts || root.alerts.length === 0) {
    return (
      <FormattedMessage
        id="disruption-info-no-alerts"
        defaultMessage="No known disruptions or diversions."
      />
    );
  }

  const [showRoutes, setShowRoutes] = useState(true);

  const routeAlerts = [];
  const stopAlerts = [];
  root.alerts.forEach(alert => {
    if (alert.route) {
      routeAlerts.push(mapAlert(alert, intl.locale));
    } else if (alert.stop) {
      stopAlerts.push(mapAlert(alert, intl.locale));
    }
  });

  return (
    <React.Fragment>
      <div className="stop-tab-container">
        <div
          className={cx('stop-tab-singletab', { active: showRoutes })}
          onClick={() => setShowRoutes(true)}
          onKeyDown={e => isKeyboardSelectionEvent(e) && setShowRoutes(true)}
          role="button"
          tabIndex="0"
        >
          <div className="stop-tab-singletab-container">
            <div>
              <Icon
                className="stop-page-tab_icon"
                img="icon-icon_bus-withoutBox"
              />
            </div>
            <div>
              <FormattedMessage id="routes" />
            </div>
          </div>
        </div>
        <div
          className={cx('stop-tab-singletab', { active: !showRoutes })}
          onClick={() => setShowRoutes(false)}
          onKeyDown={e => isKeyboardSelectionEvent(e) && setShowRoutes(false)}
          role="button"
          tabIndex="0"
        >
          <div className="stop-tab-singletab-container">
            <div>
              <Icon className="stop-page-tab_icon" img="icon-icon_bus-stop" />
            </div>
            <div>
              <FormattedMessage id="stops" />
            </div>
          </div>
        </div>
      </div>
      <AlertList serviceAlerts={showRoutes ? routeAlerts : stopAlerts} />
    </React.Fragment>
  );
}

DisruptionListContainer.contextTypes = {
  intl: intlShape,
};

DisruptionListContainer.propTypes = {
  root: PropTypes.shape({
    alerts: PropTypes.array,
  }).isRequired,
};

export default Relay.createContainer(DisruptionListContainer, {
  fragments: {
    root: () => Relay.QL`
      fragment on QueryType {
        alerts(feeds:$feedIds) {
          ${AlertContentQuery}
          route {
            color
            mode
            shortName
          }
          stop {
            code
            vehicleMode
          }
        }
      }
    `,
  },
  initialVariables: { feedIds: null },
});
