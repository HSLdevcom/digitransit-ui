/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import React from 'react';
import cx from 'classnames';
import connectToStores from 'fluxible-addons-react/connectToStores';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useRouter } from 'found';

import Disruption from './Disruption';
import {
  alertCompare,
  currentAndFutureAlerts,
  isAlertValid,
} from '../util/alertUtils';
import { alertShape } from '../util/shapes';
import { useBreakpoint } from '../util/withBreakpoint';
import { AlertSeverityLevelType } from '../constants';
import Icon from './Icon';
import { useConfigContext } from '../configurations/ConfigContext';
import Badge from './Badge';
import ExternalLink from './ExternalLink';

const EmptyDisruptions = () => {
  const config = useConfigContext();
  return (
    <div className="no-alerts-container">
      <Icon
        img="icon_no-disruptions"
        color={config.colors.primary}
        omitViewBox
      />
      <h1>Liikenne normaalia</h1>
      <FormattedMessage
        id="disruption-info-no-alerts"
        defaultMessage="No known disruptions or diversions."
      />
    </div>
  );
};

const DisruptionDetails = ({
  alertDescriptionText,
  alertHeaderText,
  alertEffect,
  alertSeverityLevel,
  alertUrl,
}) => {
  const checkedUrl =
    alertUrl &&
    (alertUrl.match(/^[a-zA-Z]+:\/\//) ? alertUrl : `http://${alertUrl}`);

  return (
    <div className="alert-details">
      <div className="alert-details-header">
        <span className="badge-container">
          <Badge showIcon variant={alertSeverityLevel} label={alertEffect} />
        </span>
        <span className="validity">
          <Icon className="clock-icon" img="icon_clock" />
          <FormattedMessage id="valid" />
        </span>
      </div>
      <div className="alert-details-content">
        {alertHeaderText && <h1>{alertHeaderText}</h1>}
        <p>{alertDescriptionText}</p>
        {checkedUrl && (
          <ExternalLink className="alert-url" href={checkedUrl}>
            <FormattedMessage id="extra-info" />
          </ExternalLink>
        )}
      </div>
    </div>
  );
};

DisruptionDetails.propTypes = {
  alertDescriptionText: PropTypes.string.isRequired,
  alertHeaderText: PropTypes.string,
  alertEffect: PropTypes.string,
  alertSeverityLevel: PropTypes.string,
  alertUrl: PropTypes.string,
};

const DisruptionList = ({
  cancelations = [],
  currentTime,
  disableScrolling,
  serviceAlerts = [],
  showLinks,
}) => {
  const { match, router } = useRouter();
  const breakpoint = useBreakpoint();

  // if a valid alertId is present in url query, show alert details
  const activeAlert =
    match.location.query.alertId &&
    serviceAlerts.find(alert => alert.id === match.location.query.alertId);
  if (activeAlert) {
    return <DisruptionDetails {...activeAlert} />;
  }

  const validCancelations = cancelations.filter(cancelation =>
    isAlertValid(cancelation, currentTime),
  );
  const toggleDetails = id => {
    router.push({ pathname: match.location.pathname, query: { alertId: id } });
  };

  // Cancelations should be between non-info alerts and info alerts
  const alertsSorted = [
    ...serviceAlerts
      .filter(alert => alert.alertSeverityLevel !== AlertSeverityLevelType.Info)
      .sort(alertCompare),
    ...validCancelations.sort(alertCompare),
    ...serviceAlerts
      .filter(alert => alert.alertSeverityLevel === AlertSeverityLevelType.Info)
      .sort(alertCompare),
  ];
  const { currentAlerts, futureAlerts } = currentAndFutureAlerts(
    alertsSorted,
    currentTime,
  );

  if (
    currentAlerts.length === 0 &&
    futureAlerts.length === 0 &&
    validCancelations.length === 0
  ) {
    return <EmptyDisruptions />;
  }

  return (
    <div className="alerts-content-wrapper">
      <div
        className={cx('alerts-list-wrapper', {
          'bp-large': breakpoint === 'large',
        })}
        aria-live="polite"
      >
        <div
          className={cx('alerts-list', {
            'momentum-scroll': !disableScrolling,
          })}
        >
          <div className="alerts-list-section-header">
            <p>Voimassa</p>
          </div>
          {currentAlerts.length ? (
            currentAlerts.map((alert, i) => (
              <Disruption
                toggleDetails={toggleDetails}
                currentTime={currentTime}
                showLinks={showLinks}
                index={i}
                key={alert.id}
                {...alert}
              />
            ))
          ) : (
            <div className="alerts-list-section-no-alerts">
              <p>Ei tiedossa voimassa olevia häiriöitä</p>
            </div>
          )}
          <div className="alerts-list-section-header">
            <p>Tulevat</p>
          </div>
          {futureAlerts.length ? (
            futureAlerts.map((alert, i) => (
              <Disruption
                toggleDetails={toggleDetails}
                currentTime={currentTime}
                showLinks={showLinks}
                index={i}
                key={alert.id}
                {...alert}
              />
            ))
          ) : (
            <div className="alerts-list-section-no-alerts">
              <p>Ei tiedossa olevia tulevia häiriöitä tai poikkeuksia</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

DisruptionList.propTypes = {
  cancelations: PropTypes.arrayOf(alertShape),
  currentTime: PropTypes.number.isRequired,
  disableScrolling: PropTypes.bool,
  serviceAlerts: PropTypes.arrayOf(alertShape),
  showLinks: PropTypes.bool,
  onClickLink: PropTypes.func,
};

const connectedComponent = connectToStores(
  DisruptionList,
  ['TimeStore', 'PreferencesStore'],
  context => ({
    currentTime: context.getStore('TimeStore').getCurrentTime(),
  }),
);

export { connectedComponent as default, DisruptionList as Component };
