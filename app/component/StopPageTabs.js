import cx from 'classnames';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import Link from 'found/Link';
import { matchShape } from 'found';
import { AlertSeverityLevelType } from '../constants';
import {
  getCancelationsForStop,
  getServiceAlertsForStop,
  getServiceAlertsForStopRoutes,
  isAlertActive,
  getActiveAlertSeverityLevel,
  getCancelationsForRoute,
  getServiceAlertsForRoute,
  getServiceAlertsForRouteStops,
} from '../util/alertUtils';
import withBreakpoint from '../util/withBreakpoint';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import {
  PREFIX_DISRUPTION,
  PREFIX_ROUTES,
  PREFIX_STOPS,
  PREFIX_TERMINALS,
  PREFIX_TIMETABLE,
} from '../util/path';

const Tab = {
  Disruptions: PREFIX_DISRUPTION,
  RightNow: 'right-now',
  RoutesAndPlatforms: PREFIX_ROUTES,
  Timetable: PREFIX_TIMETABLE,
};

const getActiveTab = pathname => {
  if (pathname.indexOf(`/${Tab.Disruptions}`) > -1) {
    return Tab.Disruptions;
  }
  if (pathname.indexOf(`/${Tab.RoutesAndPlatforms}`) > -1) {
    return Tab.RoutesAndPlatforms;
  }
  if (pathname.indexOf(`/${Tab.Timetable}`) > -1) {
    return Tab.Timetable;
  }
  return Tab.RightNow;
};

function StopPageTabs({ breakpoint, stop }, { intl, match }) {
  if (
    !stop ||
    (match.location.state &&
      match.location.state.fullscreenMap === true &&
      breakpoint !== 'large')
  ) {
    return null;
  }
  const activeTab = getActiveTab(match.location.pathname);
  const isTerminal = match.params.terminalId != null;
  const urlBase = `/${
    isTerminal ? PREFIX_TERMINALS : PREFIX_STOPS
  }/${encodeURIComponent(
    match.params.terminalId ? match.params.terminalId : match.params.stopId,
  )}`;

  const currentTime = moment().unix();

  const hasActiveAlert = isAlertActive(
    getCancelationsForStop(stop),
    [...getServiceAlertsForStop(stop), ...getServiceAlertsForStopRoutes(stop)],
    currentTime,
  );
  const hasActiveServiceAlerts =
    getActiveAlertSeverityLevel(
      getServiceAlertsForStop(stop, intl),
      currentTime,
    ) ||
    getActiveAlertSeverityLevel(
      getServiceAlertsForStopRoutes(stop, intl),
      currentTime,
    );

  const stopRoutesWithAlerts = [];

  const modesByRoute = []; // DT-3387

  if (stop.routes && stop.routes.length > 0) {
    stop.routes.forEach(route => {
      modesByRoute.push(route.mode); // DT-3387
      const patternId = route.patterns.code;
      const hasActiveRouteAlert = isAlertActive(
        getCancelationsForRoute(route, patternId),
        [
          ...getServiceAlertsForRoute(route, patternId),
          ...getServiceAlertsForRouteStops(route, patternId),
        ],
        currentTime,
      );
      const hasActiveRouteServiceAlerts = getActiveAlertSeverityLevel(
        getServiceAlertsForRoute(route, patternId),
        currentTime,
      );
      return (
        (hasActiveRouteAlert || hasActiveRouteServiceAlerts) &&
        stopRoutesWithAlerts.push(...route.alerts)
      );
    });
  }

  const disruptionClassName =
    ((hasActiveAlert ||
      stopRoutesWithAlerts.some(
        alert =>
          alert.alertSeverityLevel === AlertSeverityLevelType.Severe ||
          alert.alertSeverityLevel === AlertSeverityLevelType.Warning,
      )) &&
      'active-disruption-alert') ||
    ((hasActiveServiceAlerts ||
      stopRoutesWithAlerts.some(
        alert =>
          alert.alertSeverityLevel === AlertSeverityLevelType.Severe ||
          alert.alertSeverityLevel === AlertSeverityLevelType.Warning,
      )) &&
      'active-service-alert');

  return (
    <div>
      <div className="stop-tab-container" role="tablist">
        <Link
          to={urlBase}
          className={cx('stop-tab-singletab', {
            active: activeTab === Tab.RightNow,
          })}
          onClick={() => {
            addAnalyticsEvent({
              category: 'Stop',
              action: 'OpenRightNowTab',
              name: null,
            });
          }}
          role="tab"
        >
          <div className="stop-tab-singletab-container">
            <div>
              <FormattedMessage id="right-now" defaultMessage="right now" />
            </div>
          </div>
        </Link>
        <Link
          to={`${urlBase}/${Tab.Timetable}`}
          className={cx('stop-tab-singletab', {
            active: activeTab === Tab.Timetable,
          })}
          onClick={() => {
            addAnalyticsEvent({
              category: 'Stop',
              action: 'OpenTimetableTab',
              name: null,
            });
          }}
          role="tab"
        >
          <div className="stop-tab-singletab-container">
            <div>
              <FormattedMessage id="timetable" defaultMessage="timetable" />
            </div>
          </div>
        </Link>
        <Link
          to={`${urlBase}/${Tab.Disruptions}`}
          className={cx('stop-tab-singletab', {
            active: activeTab === Tab.Disruptions,
            'alert-active': hasActiveAlert || stopRoutesWithAlerts.length > 0,
            'service-alert-active':
              hasActiveServiceAlerts || stopRoutesWithAlerts.length > 0,
          })}
          onClick={() => {
            addAnalyticsEvent({
              category: 'Stop',
              action: 'OpenDisruptionsTab',
              name: null,
            });
          }}
          role="tab"
        >
          <div className="stop-tab-singletab-container">
            <div className={`${disruptionClassName || `no-alerts`}`}>
              <FormattedMessage id="disruptions" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

const alertArrayShape = PropTypes.arrayOf(
  PropTypes.shape({ alertSeverityLevel: PropTypes.string }),
);

StopPageTabs.propTypes = {
  breakpoint: PropTypes.string.isRequired,
  stop: PropTypes.shape({
    routes: PropTypes.array,
    alerts: alertArrayShape,
    vehicleMode: PropTypes.string,
    stoptimes: PropTypes.arrayOf(
      PropTypes.shape({
        realtimeState: PropTypes.string,
        trip: PropTypes.shape({
          pattern: PropTypes.shape({
            code: PropTypes.string,
          }),
          route: PropTypes.shape({
            alerts: alertArrayShape,
            trip: PropTypes.shape({
              pattern: PropTypes.shape({
                code: PropTypes.string,
              }),
            }),
          }),
        }),
      }),
    ),
  }),
};

StopPageTabs.defaultProps = {
  stop: undefined,
};

StopPageTabs.contextTypes = {
  intl: intlShape.isRequired,
  match: matchShape.isRequired,
};

const componentWithBreakpoint = withBreakpoint(StopPageTabs);

export { componentWithBreakpoint as default, StopPageTabs as Component };
