/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import React from 'react';
import cx from 'classnames';
import connectToStores from 'fluxible-addons-react/connectToStores';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useRouter } from 'found';

import Disruption from './Disruption';
import DisruptionDetails from './DisruptionDetails';
import {
  currentAndFutureAlerts,
  isAlertValid,
  getUniqueAlerts,
  alertSeverityCompare,
} from '../util/alertUtils';
import { alertShape } from '../util/shapes';
import { useBreakpoint } from '../util/withBreakpoint';
import Icon from './Icon';
import { useConfigContext } from '../configurations/ConfigContext';

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

const DisruptionList = ({
  cancelations = [],
  currentTime,
  disableScrolling = false,
  serviceAlerts = [],
}) => {
  const { match, router } = useRouter();
  const breakpoint = useBreakpoint();

  // if a valid alertId is present in url query, show alert details
  const activeAlert =
    match.location.query.alertId &&
    serviceAlerts.find(alert => alert.id === match.location.query.alertId);
  if (activeAlert) {
    return (
      <DisruptionDetails
        currentTime={currentTime}
        alertDescriptionText={activeAlert.alertDescriptionText || ''}
        alertHeaderText={activeAlert.alertHeaderText}
        alertEffect={activeAlert.alertEffect}
        alertSeverityLevel={activeAlert.alertSeverityLevel}
        alertUrl={activeAlert.alertUrl}
        effectiveStartDate={activeAlert.effectiveStartDate}
      />
    );
  }

  const validCancelations = cancelations.filter(cancelation =>
    isAlertValid(cancelation, currentTime),
  );
  const toggleDetails = id => {
    router.push({ pathname: match.location.pathname, query: { alertId: id } });
  };

  const { currentAlerts, futureAlerts } = currentAndFutureAlerts(
    getUniqueAlerts(serviceAlerts).sort((a, b) => alertSeverityCompare(a, b)),
    currentTime,
  );

  const current = [...validCancelations, ...currentAlerts];

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
          {current.length ? (
            <div role="list">
              {current.map(alert => (
                <Disruption
                  toggleDetails={toggleDetails}
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
              {futureAlerts.map(alert => (
                <Disruption
                  toggleDetails={toggleDetails}
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
  currentTime: PropTypes.number.isRequired,
  disableScrolling: PropTypes.bool,
  serviceAlerts: PropTypes.arrayOf(alertShape),
};

const connectedComponent = connectToStores(
  DisruptionList,
  ['TimeStore'],
  context => ({
    currentTime: context.getStore('TimeStore').getCurrentTime(),
  }),
);

export { connectedComponent as default, DisruptionList as Component };
