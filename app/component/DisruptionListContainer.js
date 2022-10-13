import cx from 'classnames';
import connectToStores from 'fluxible-addons-react/connectToStores';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import AlertList from './AlertList';
import Icon from './Icon';
import { AlertSeverityLevelType } from '../constants';
import {
  getServiceAlertDescription,
  getServiceAlertHeader,
  getServiceAlertUrl,
  isAlertValid,
  createUniqueAlertList,
} from '../util/alertUtils';
import { isKeyboardSelectionEvent } from '../util/browser';
import withBreakpoint from '../util/withBreakpoint';

const isDisruption = alert =>
  alert && alert.severityLevel !== AlertSeverityLevelType.Info;
const isInfo = alert => !isDisruption(alert);

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
  source: alert.feed,
});

function DisruptionListContainer(
  { breakpoint, currentTime, viewer },
  { intl },
) {
  if (!viewer || !viewer.alerts || viewer.alerts.length === 0) {
    return (
      <div className="stop-no-alerts-container">
        <FormattedMessage
          id="disruption-info-no-alerts"
          defaultMessage="No known disruptions or diversions."
        />
      </div>
    );
  }

  const routeAlerts = [];
  const stopAlerts = [];
  const mappedRouteDisruptions = [];
  const mappedRouteServiceAlerts = [];

  const mappedStopDisruptions = [];
  const mappedStopServiceAlerts = [];

  viewer.alerts.forEach(alert => {
    const mappedAlert = mapAlert(alert, intl.locale);
    if (!isAlertValid(mappedAlert, currentTime)) {
      return;
    }
    if (!isDisruption(mappedAlert)) {
      if (alert.route) {
        mappedRouteServiceAlerts.push(mappedAlert);
      } else if (alert.stop) {
        mappedStopServiceAlerts.push(mappedAlert);
      }
    } else if (alert.route) {
      mappedRouteDisruptions.push(mappedAlert);
    } else if (alert.stop) {
      mappedStopDisruptions.push(mappedAlert);
    }

    if (alert.route) {
      routeAlerts.push(mappedAlert);
    } else if (alert.stop) {
      stopAlerts.push(mappedAlert);
    }
  });

  const disruptionCount =
    createUniqueAlertList(mappedRouteDisruptions, false, currentTime, true)
      .length +
    createUniqueAlertList(mappedStopDisruptions, false, currentTime, true)
      .length;
  const infoCount =
    createUniqueAlertList(mappedRouteServiceAlerts, false, currentTime, true)
      .length +
    createUniqueAlertList(mappedStopServiceAlerts, false, currentTime, true)
      .length;

  const [showDisruptions, setShowDisruptions] = useState(disruptionCount > 0);

  const routeAlertsToShow = routeAlerts.filter(
    showDisruptions ? isDisruption : isInfo,
  );
  const stopAlertsToShow = stopAlerts.filter(
    showDisruptions ? isDisruption : isInfo,
  );

  return (
    <div className="disruption-list-container">
      <div
        className={cx('stop-tab-container', {
          collapsed: !disruptionCount || !infoCount,
        })}
      >
        <div
          className={cx('stop-tab-singletab', {
            active: showDisruptions,
          })}
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
              {`${intl.formatMessage({
                id: 'disruptions',
              })} (${disruptionCount})`}
            </div>
          </div>
        </div>
        <div
          className={cx('stop-tab-singletab', {
            active: !showDisruptions,
          })}
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
              {`${intl.formatMessage({
                id: 'releases',
              })} (${infoCount})`}
            </div>
          </div>
        </div>
      </div>
      <div
        className={cx('disruption-list-content momentum-scroll', {
          'disruption-list-content__large': breakpoint === 'large',
        })}
      >
        {routeAlertsToShow.length > 0 && (
          <React.Fragment>
            <div>
              <FormattedMessage id="routes" tagName="h2" />
            </div>
            <AlertList
              disableScrolling
              showRouteNameLink
              serviceAlerts={routeAlertsToShow}
            />
          </React.Fragment>
        )}
        {stopAlertsToShow.length > 0 && (
          <React.Fragment>
            <div>
              <FormattedMessage id="stops" tagName="h2" />
            </div>
            <AlertList
              disableScrolling
              showRouteNameLink
              serviceAlerts={stopAlertsToShow}
            />
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

DisruptionListContainer.contextTypes = {
  intl: intlShape,
};

DisruptionListContainer.propTypes = {
  breakpoint: PropTypes.string,
  currentTime: PropTypes.number.isRequired,
  viewer: PropTypes.shape({
    alerts: PropTypes.array,
  }).isRequired,
};

DisruptionListContainer.defaultProps = {
  breakpoint: 'small',
};

const containerComponent = createFragmentContainer(
  connectToStores(
    withBreakpoint(DisruptionListContainer),
    ['TimeStore'],
    context => ({
      currentTime: context.getStore('TimeStore').getCurrentTime().unix(),
    }),
  ),
  {
    viewer: graphql`
      fragment DisruptionListContainer_viewer on QueryType
      @argumentDefinitions(feedIds: { type: "[String!]", defaultValue: [] }) {
        alerts(feeds: $feedIds) {
          feed
          id
          alertDescriptionText
          alertHash
          alertHeaderText
          alertSeverityLevel
          alertUrl
          effectiveEndDate
          effectiveStartDate
          alertDescriptionTextTranslations {
            language
            text
          }
          alertHeaderTextTranslations {
            language
            text
          }
          alertUrlTranslations {
            language
            text
          }
          route {
            color
            mode
            shortName
            gtfsId
          }
          stop {
            name
            code
            vehicleMode
            gtfsId
          }
        }
      }
    `,
  },
);

export { containerComponent as default, DisruptionListContainer as Component };
