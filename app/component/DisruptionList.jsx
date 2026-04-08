/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useRouter } from 'found';

import Disruption from './Disruption';
import { currentAndFutureAlerts, isAlertValid } from '../../utils/client/alertUtils';
import { alertShape } from '../../utils/client/shapes';
import { useCurrentTime } from '../hooks/TimeContext';
import { useBreakpoint } from '../../utils/client/withBreakpoint';
import Icon from './Icon';
import { useConfigContext } from '../client/ConfigContext';
import Badge from './Badge';
import ExternalLink from './ExternalLink';

export const EmptyDisruptions = () => {
  const config = useConfigContext();
  return (
    <div className="no-alerts-container">
      <Icon
        img="icon_no-disruptions"
        color={config.colors.primary}
        omitViewBox
      />
      <h2>
        <FormattedMessage
          id="disruption-list-traffic-normal"
          defaultMessage="Traffic normal"
        />
      </h2>
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
          <Badge
            showIcon
            variant={alertSeverityLevel}
            label={alertEffect || 'no_service'}
          />
        </span>
        <span className="validity">
          <Icon className="clock-icon" img="icon_clock" />
          <FormattedMessage id="valid" />
        </span>
      </div>
      <div className="alert-details-content">
        {alertHeaderText && <h2>{alertHeaderText}</h2>}
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
  disableScrolling = false,
  serviceAlerts = [],
  showLinks = false,
  onClickLink,
}) => {
  const { match, router } = useRouter();
  const breakpoint = useBreakpoint();
  const currentTime = useCurrentTime();

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

  const uniqueByAlertHash = alerts =>
    alerts.filter(
      (alert, index, self) =>
        index === self.findIndex(a => a.alertHash === alert.alertHash),
    );

  const { currentAlerts, futureAlerts } = currentAndFutureAlerts(
    uniqueByAlertHash(serviceAlerts),
    currentTime,
  );

  const ca = [...validCancelations, ...currentAlerts];

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
          <h2 className="alerts-list-section-header">
            <FormattedMessage
              id="disruption-list-active"
              defaultMessage="Active"
            />
          </h2>
          {ca.length ? (
            <div role="list">
              {ca.map((alert, i) => (
                <Disruption
                  toggleDetails={toggleDetails}
                  currentTime={currentTime}
                  showLinks={showLinks}
                  onClickLink={onClickLink}
                  index={i}
                  key={alert.id}
                  {...alert}
                />
              ))}
            </div>
          ) : (
            <p className="alerts-list-section-no-alerts">
              <FormattedMessage
                id="disruption-list-no-active-alerts"
                defaultMessage="No known active disruptions"
              />
            </p>
          )}
          <h2 className="alerts-list-section-header">
            <FormattedMessage
              id="disruption-list-upcoming"
              defaultMessage="Upcoming"
            />
          </h2>
          {futureAlerts.length ? (
            <div role="list">
              {futureAlerts.map((alert, i) => (
                <Disruption
                  toggleDetails={toggleDetails}
                  currentTime={currentTime}
                  showLinks={showLinks}
                  onClickLink={onClickLink}
                  index={i}
                  key={alert.id}
                  {...alert}
                />
              ))}
            </div>
          ) : (
            <p className="alerts-list-section-no-alerts">
              <FormattedMessage
                id="disruption-list-no-upcoming-alerts"
                defaultMessage="No known upcoming disruptions or diversions"
              />
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

DisruptionList.propTypes = {
  cancelations: PropTypes.arrayOf(alertShape),
  disableScrolling: PropTypes.bool,
  serviceAlerts: PropTypes.arrayOf(alertShape),
  showLinks: PropTypes.bool,
  onClickLink: PropTypes.func,
};

export default DisruptionList;
