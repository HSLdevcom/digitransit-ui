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
import { AlertSeverityLevelType } from '../constants';

const isDisruptive = alert =>
  alert && alert.severityLevel !== AlertSeverityLevelType.Info;
const isInformational = alert => !isDisruptive(alert);

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

  const [showDisruptions, setShowDisruptions] = useState(true);

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
    <div className="disruption-list-container">
      <div className="stop-tab-container">
        <div
          className={cx('stop-tab-singletab', { active: showDisruptions })}
          onClick={() => setShowDisruptions(true)}
          onKeyDown={e =>
            isKeyboardSelectionEvent(e) && setShowDisruptions(true)
          }
          role="button"
          tabIndex="0"
        >
          <div className="stop-tab-singletab-container">
            <div>
              <Icon
                className="stop-page-tab_icon caution"
                img="icon-icon_caution"
              />
            </div>
            <div>
              <FormattedMessage id="disruptions" />
            </div>
          </div>
        </div>
        <div
          className={cx('stop-tab-singletab', { active: !showDisruptions })}
          onClick={() => setShowDisruptions(false)}
          onKeyDown={e =>
            isKeyboardSelectionEvent(e) && setShowDisruptions(false)
          }
          role="button"
          tabIndex="0"
        >
          <div className="stop-tab-singletab-container">
            <div>
              <Icon className="stop-page-tab_icon info" img="icon-icon_info" />
            </div>
            <div>
              <FormattedMessage id="notifications" />
            </div>
          </div>
        </div>
      </div>
      <div className="disruption-list-content momentum-scroll">
        <div>
          <FormattedMessage id="routes" tagName="h2" />
        </div>
        <AlertList
          disableScrolling
          serviceAlerts={routeAlerts.filter(
            showDisruptions ? isDisruptive : isInformational,
          )}
        />
        <div>
          <FormattedMessage id="stops" tagName="h2" />
        </div>
        <AlertList
          disableScrolling
          serviceAlerts={stopAlerts.filter(
            showDisruptions ? isDisruptive : isInformational,
          )}
        />
      </div>
    </div>
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
