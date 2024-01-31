/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import cx from 'classnames';
import connectToStores from 'fluxible-addons-react/connectToStores';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import AlertRow from './AlertRow';
import {
  alertCompare,
  getEntitiesOfType,
  isAlertValid,
} from '../util/alertUtils';
import { AlertShape } from '../util/shapes';
import withBreakpoint from '../util/withBreakpoint';
import { AlertEntityType, AlertSeverityLevelType } from '../constants';

const AlertList = ({
  cancelations,
  currentTime,
  disableScrolling,
  serviceAlerts,
  showLinks,
  breakpoint,
}) => {
  const validAlerts = serviceAlerts.filter(alert =>
    isAlertValid(alert, currentTime),
  );
  const validCancelations = cancelations.filter(cancelation =>
    isAlertValid(cancelation, currentTime),
  );

  if (validAlerts.length === 0 && validCancelations.length === 0) {
    return (
      <div className="no-alerts-container" tabIndex="0" aria-live="polite">
        <FormattedMessage
          id="disruption-info-no-alerts"
          defaultMessage="No known disruptions or diversions."
        />
      </div>
    );
  }

  // Cancelations should be between non-info alerts and info alerts
  const alertsSorted = [
    ...validAlerts
      .filter(alert => alert.alertSeverityLevel !== AlertSeverityLevelType.Info)
      .sort(alertCompare),
    ...validCancelations.sort(alertCompare),
    ...validAlerts
      .filter(alert => alert.alertSeverityLevel === AlertSeverityLevelType.Info)
      .sort(alertCompare),
  ];

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
          {alertsSorted.map(
            (
              {
                alertDescriptionText,
                alertHeaderText,
                entities,
                alertSeverityLevel,
                alertUrl,
                effectiveStartDate,
                effectiveEndDate,
                feed,
              },
              i,
            ) => {
              const entityType =
                getEntitiesOfType(entities, AlertEntityType.Stop).length > 0
                  ? 'stop'
                  : 'route';
              return (
                <AlertRow
                  currentTime={currentTime}
                  description={alertDescriptionText}
                  endTime={effectiveEndDate}
                  entities={entities}
                  feed={feed}
                  header={alertHeaderText}
                  // eslint-disable-next-line react/no-array-index-key
                  key={`alert-${entityType}-${alertSeverityLevel}-${i}`}
                  severityLevel={alertSeverityLevel}
                  showLinks={showLinks}
                  startTime={effectiveStartDate}
                  url={alertUrl}
                  index={i}
                />
              );
            },
          )}
        </div>
      </div>
    </div>
  );
};

AlertList.propTypes = {
  cancelations: PropTypes.arrayOf(AlertShape),
  currentTime: PropTypes.PropTypes.number.isRequired,
  disableScrolling: PropTypes.bool,
  serviceAlerts: PropTypes.arrayOf(AlertShape),
  showLinks: PropTypes.bool,
  breakpoint: PropTypes.string,
};

AlertList.defaultProps = {
  cancelations: [],
  disableScrolling: false,
  serviceAlerts: [],
};

const connectedComponent = connectToStores(
  withBreakpoint(AlertList),
  ['TimeStore', 'PreferencesStore'],
  context => ({
    currentTime: context.getStore('TimeStore').getCurrentTime().unix(),
  }),
);

export { connectedComponent as default, AlertList as Component };
