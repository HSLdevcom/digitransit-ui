/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import cx from 'classnames';
import connectToStores from 'fluxible-addons-react/connectToStores';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import AlertRow from './AlertRow';
import {
  alertCompare,
  currentAndFutureAlerts,
  getEntitiesOfType,
  isAlertValid,
} from '../util/alertUtils';
import { alertShape } from '../util/shapes';
import withBreakpoint from '../util/withBreakpoint';
import { AlertEntityType, AlertSeverityLevelType } from '../constants';
import Icon from './Icon';
import { useConfigContext } from '../configurations/ConfigContext';

const NoAlerts = () => {
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

const AlertList = ({
  cancelations,
  currentTime,
  disableScrolling,
  serviceAlerts,
  showLinks,
  breakpoint,
  onClickLink,
}) => {
  const validAlerts = serviceAlerts.filter(alert =>
    isAlertValid(alert, currentTime),
  );
  const { currentAlerts, futureAlerts } = currentAndFutureAlerts(
    serviceAlerts,
    currentTime,
  );
  const validCancelations = cancelations.filter(cancelation =>
    isAlertValid(cancelation, currentTime),
  );

  if (
    currentAlerts.length === 0 &&
    futureAlerts.length === 0 &&
    validCancelations.length === 0
  ) {
    return <NoAlerts />;
  }

  // Cancelations should be between non-info alerts and info alerts
  // const alertsSorted = [
  //   ...validAlerts
  //     .filter(alert => alert.alertSeverityLevel !== AlertSeverityLevelType.Info)
  //     .sort(alertCompare),
  //   ...validCancelations.sort(alertCompare),
  //   ...validAlerts
  //     .filter(alert => alert.alertSeverityLevel === AlertSeverityLevelType.Info)
  //     .sort(alertCompare),
  // ];

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
            currentAlerts.map(
              (
                {
                  alertDescriptionText,
                  alertHeaderText,
                  alertEffect,
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
                    alertEffect={alertEffect}
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
                    onClickLink={onClickLink}
                  />
                );
              },
            )
          ) : (
            <div>
              <p>Ei tiedossa voimassa olevia häiriöitä</p>
            </div>
          )}
          <div className="alerts-list-section-header">
            <p>Tulevat</p>
          </div>
          {futureAlerts.length ? (
            futureAlerts.map(
              (
                {
                  alertDescriptionText,
                  alertHeaderText,
                  alertEffect,
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
                    alertEffect={alertEffect}
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
                    onClickLink={onClickLink}
                  />
                );
              },
            )
          ) : (
            <div>
              <p>Ei tiedossa tulevia häiriöitä</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

AlertList.propTypes = {
  cancelations: PropTypes.arrayOf(alertShape),
  currentTime: PropTypes.PropTypes.number.isRequired,
  disableScrolling: PropTypes.bool,
  serviceAlerts: PropTypes.arrayOf(alertShape),
  showLinks: PropTypes.bool,
  breakpoint: PropTypes.string,
  onClickLink: PropTypes.func,
};

AlertList.defaultProps = {
  cancelations: [],
  disableScrolling: false,
  serviceAlerts: [],
  showLinks: false,
  breakpoint: undefined,
  onClickLink: undefined,
};

const connectedComponent = connectToStores(
  withBreakpoint(AlertList),
  ['TimeStore', 'PreferencesStore'],
  context => ({
    currentTime: context.getStore('TimeStore').getCurrentTime(),
  }),
);

export { connectedComponent as default, AlertList as Component };
