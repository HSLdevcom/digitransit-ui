/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { useRouter } from 'found';
import { SuccessAnimationView } from '@hsl-fi/notifications';
import groupBy from 'lodash/groupBy';

import Disruption from './Disruption';
import DisruptionDetails from './DisruptionDetails';
import {
  currentAndFutureAlerts,
  getUniqueAlerts,
  alertSeverityCompare,
} from '../../utils/client/alertUtils';
import { alertShape } from '../../utils/client/shapes';
import { useCurrentTime } from '../hooks/TimeContext';
import { PREFIX_DISRUPTION, PREFIX_TIMETABLE } from '../../utils/shared/path';
import { useBreakpoint } from '../../utils/client/withBreakpoint';
import Icon from './Icon';
import { useConfigContext } from '../client/ConfigContext';
import { isToday } from '../../utils/client/timeUtils';

export const EmptyDisruptions = () => {
  const intl = useIntl();
  const config = useConfigContext();
  return config.iconModeSet === 'hsl' ? (
    <SuccessAnimationView
      heading={intl.formatMessage({ id: 'disruption-list-traffic-normal' })}
      description={intl.formatMessage({ id: 'disruption-info-no-alerts' })}
      headingLevel={3}
    />
  ) : (
    <div className="no-alerts-container">
      <Icon
        img="icon_no-disruptions"
        color={config.colors.primary}
        height={3}
        width={3}
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
  disableScrolling = false,
  serviceAlerts = [],
  onClickLink,
}) => {
  const { match, router } = useRouter();
  const breakpoint = useBreakpoint();
  const currentTime = useCurrentTime();
  const intl = useIntl();

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

  const cancelationsByValidity = groupBy(
    cancelations,
    ({ effectiveStartDate }) =>
      isToday(effectiveStartDate * 1000, currentTime * 1000)
        ? 'ongoing'
        : 'upcoming',
  );
  const toggleDetails = id => {
    router.push({ pathname: match.location.pathname, query: { alertId: id } });
  };

  const { currentAlerts, futureAlerts } = currentAndFutureAlerts(
    getUniqueAlerts(serviceAlerts).sort((a, b) => alertSeverityCompare(a, b)),
    currentTime,
  );

  const current = [...(cancelationsByValidity.ongoing || []), ...currentAlerts];
  const future = [...(cancelationsByValidity.upcoming || []), ...futureAlerts];

  if (current.length === 0 && future.length === 0) {
    return <EmptyDisruptions />;
  }

  const timetableUrl = match.location.pathname.replace(
    PREFIX_DISRUPTION,
    PREFIX_TIMETABLE,
  );
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
              {current.map(disruption =>
                // if the disruption is a cancelation, link to timetable
                disruption.canceledDepartures ? (
                  <Disruption
                    toggleDetails={() => router.push(timetableUrl)}
                    onClickLink={onClickLink}
                    key={disruption.id}
                    {...disruption}
                  />
                ) : (
                  <Disruption
                    toggleDetails={() => toggleDetails(disruption.id)}
                    onClickLink={onClickLink}
                    key={disruption.id}
                    {...disruption}
                  />
                ),
              )}
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
          {future.length ? (
            <div role="list">
              {future.map(disruption =>
                disruption.canceledDepartures ? (
                  <Disruption
                    toggleDetails={() => router.push(timetableUrl)}
                    onClickLink={onClickLink}
                    key={disruption.id}
                    {...disruption}
                  />
                ) : (
                  <Disruption
                    toggleDetails={() => toggleDetails(disruption.id)}
                    onClickLink={onClickLink}
                    key={disruption.id}
                    {...disruption}
                  />
                ),
              )}
            </div>
          ) : (
            <div className="alerts-list-section-no-alerts">
              <Icon img="icon_info" />
              {intl.formatMessage({
                id: 'disruption-list-no-upcoming-alerts',
                defaultMessage: 'No known upcoming disruptions or diversions',
              })}
            </div>
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
  onClickLink: PropTypes.func,
};

export default DisruptionList;
