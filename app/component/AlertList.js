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
import withBreakpoint from '../util/withBreakpoint';

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

  const alertsSorted = [
    ...validCancelations.sort(alertCompare).map(cancelation => {
      return { ...cancelation, isCancelation: true };
    }),
    ...validAlerts.sort(alertCompare),
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
                isCancelation,
              },
              i,
            ) => {
              const entityType =
                getEntitiesOfType(entities, 'Stop').length > 0
                  ? 'stop'
                  : 'route';
              return (
                <AlertRow
                  currentTime={currentTime}
                  description={alertDescriptionText}
                  endTime={isCancelation ? undefined : effectiveEndDate}
                  entities={entities}
                  feed={feed}
                  header={alertHeaderText}
                  // eslint-disable-next-line react/no-array-index-key
                  key={`alert-${entityType}-${alertSeverityLevel}-${i}`}
                  severityLevel={alertSeverityLevel}
                  showLinks={showLinks}
                  startTime={effectiveStartDate}
                  url={alertUrl}
                />
              );
            },
          )}
        </div>
      </div>
    </div>
  );
};

const alertShape = PropTypes.shape({
  alertDescriptionText: PropTypes.string,
  effectiveEndDate: PropTypes.number,
  effectiveStartDate: PropTypes.number.isRequired,
  alertHeaderText: PropTypes.string,
  alertSeverityLevel: PropTypes.string,
  alertUrl: PropTypes.string,
  entities: PropTypes.shape({
    __typename: PropTypes.string.isRequired,
    gtfsId: PropTypes.string.isRequired,
  }),
});

AlertList.propTypes = {
  cancelations: PropTypes.arrayOf(alertShape),
  currentTime: PropTypes.PropTypes.number.isRequired,
  disableScrolling: PropTypes.bool,
  serviceAlerts: PropTypes.arrayOf(alertShape),
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
