/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import cx from 'classnames';
import connectToStores from 'fluxible-addons-react/connectToStores';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import AlertRow from './AlertRow';
import { alertCompare, getEntitiesOfType } from '../util/alertUtils';
import withBreakpoint from '../util/withBreakpoint';

const AlertList = ({
  // cancelations, TODO
  color,
  currentTime,
  disableScrolling,
  mode,
  serviceAlerts,
  showLinks,
  breakpoint,
}) => {
  if (serviceAlerts.length === 0) {
    return (
      <div className="no-alerts-container" tabIndex="0" aria-live="polite">
        <FormattedMessage
          id="disruption-info-no-alerts"
          defaultMessage="No known disruptions or diversions."
        />
      </div>
    );
  }

  const alertsSorted = serviceAlerts.sort(alertCompare);

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
                getEntitiesOfType(entities, 'Stop').length > 0
                  ? 'stop'
                  : 'route';
              return (
                <AlertRow
                  color={color}
                  currentTime={currentTime}
                  description={alertDescriptionText}
                  endTime={effectiveEndDate}
                  entities={entities}
                  feed={feed}
                  header={alertHeaderText}
                  // eslint-disable-next-line react/no-array-index-key
                  key={`alert-${entityType}-${alertSeverityLevel}-${i}`}
                  mode={mode}
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
  description: PropTypes.string,
  effectiveEndDate: PropTypes.number,
  effectiveStartDate: PropTypes.number.isRequired,
  header: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  route: PropTypes.shape({
    color: PropTypes.string,
    mode: PropTypes.string,
    shortName: PropTypes.string,
  }),
  alertSeverityLevel: PropTypes.string,
  stop: PropTypes.shape({
    code: PropTypes.string,
    vehicleMode: PropTypes.string,
  }),
  url: PropTypes.string,
});

AlertList.propTypes = {
  // cancelations: PropTypes.arrayOf(alertShape), TODO
  color: PropTypes.string,
  currentTime: PropTypes.PropTypes.number.isRequired,
  disableScrolling: PropTypes.bool,
  mode: PropTypes.string,
  serviceAlerts: PropTypes.arrayOf(alertShape),
  showLinks: PropTypes.bool,
  breakpoint: PropTypes.string,
};

AlertList.defaultProps = {
  // cancelations: [], TODO
  color: undefined,
  disableScrolling: false,
  mode: undefined,
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
