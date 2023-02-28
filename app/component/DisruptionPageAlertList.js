/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import cx from 'classnames';
import connectToStores from 'fluxible-addons-react/connectToStores';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import AlertRow from './AlertRow';
import {
  getServiceAlertDescription,
  getServiceAlertHeader,
  getServiceAlertUrl,
  newAlertCompare,
} from '../util/alertUtils';
import withBreakpoint from '../util/withBreakpoint';

const mapAlert = (alert, locale) => ({
  description: getServiceAlertDescription(alert, locale),
  header: getServiceAlertHeader(alert, locale),
  entities: alert.entities,
  severityLevel: alert.alertSeverityLevel,
  url: getServiceAlertUrl(alert, locale),
  validityPeriod: alert.validityPeriod,
  feed: alert.feed,
});

const DisruptionPageAlertList = ({
  // cancelations, TODO
  color,
  currentTime,
  disableScrolling,
  mode,
  serviceAlerts,
  showRouteNameLink,
  showRouteIcon,
  breakpoint,
  lang,
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

  const simplifiedAlertsSorted = serviceAlerts
    .map(alert => mapAlert(alert, lang))
    .sort(newAlertCompare);

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
          {simplifiedAlertsSorted.map(
            (
              {
                description,
                header,
                entities,
                severityLevel,
                url,
                validityPeriod: { startTime, endTime },
                feed,
              },
              i,
            ) => (
              <AlertRow
                color={color}
                currentTime={currentTime}
                description={description}
                endTime={endTime}
                entities={entities}
                feed={feed}
                header={header}
                // eslint-disable-next-line react/no-array-index-key
                key={`alert-${
                  showRouteIcon ? 'route' : 'general'
                }-${severityLevel}-${i}`}
                mode={mode}
                severityLevel={severityLevel}
                showRouteIcon={showRouteIcon}
                showRouteNameLink={showRouteNameLink}
                startTime={startTime}
                url={url}
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
};

const alertShape = PropTypes.shape({
  description: PropTypes.string,
  header: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  route: PropTypes.shape({
    color: PropTypes.string,
    mode: PropTypes.string,
    shortName: PropTypes.string,
  }),
  severityLevel: PropTypes.string,
  stop: PropTypes.shape({
    code: PropTypes.string,
    vehicleMode: PropTypes.string,
  }),
  url: PropTypes.string,
  validityPeriod: PropTypes.shape({
    startTime: PropTypes.number.isRequired,
    endTime: PropTypes.number,
  }).isRequired,
});

DisruptionPageAlertList.propTypes = {
  // cancelations: PropTypes.arrayOf(alertShape), TODO
  color: PropTypes.string,
  currentTime: PropTypes.PropTypes.number.isRequired,
  disableScrolling: PropTypes.bool,
  mode: PropTypes.string,
  serviceAlerts: PropTypes.arrayOf(alertShape),
  showRouteNameLink: PropTypes.bool,
  showRouteIcon: PropTypes.bool,
  breakpoint: PropTypes.string,
  lang: PropTypes.string.isRequired,
};

DisruptionPageAlertList.defaultProps = {
  // cancelations: [], TODO
  color: undefined,
  disableScrolling: false,
  mode: undefined,
  serviceAlerts: [],
  showRouteIcon: false,
};

const connectedComponent = connectToStores(
  withBreakpoint(DisruptionPageAlertList),
  ['TimeStore', 'PreferencesStore'],
  context => ({
    currentTime: context.getStore('TimeStore').getCurrentTime().unix(),
    lang: context.getStore('PreferencesStore').getLanguage(),
  }),
);

export { connectedComponent as default, DisruptionPageAlertList as Component };
