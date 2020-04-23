import cx from 'classnames';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import Relay from 'react-relay/classic';
import { Link } from 'react-router';
import some from 'lodash/some';
import { AlertSeverityLevelType } from '../constants';
import Icon from './Icon';
import {
  RouteAlertsWithContentQuery,
  StopAlertsWithContentQuery,
} from '../util/alertQueries';
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

function StopPageTabContainer(
  { children, params, routes, breakpoint, location: { pathname }, stop },
  { intl },
) {
  if (!stop || (some(routes, 'fullscreenMap') && breakpoint !== 'large')) {
    return null;
  }
  const activeTab = getActiveTab(pathname);
  const isTerminal = params.terminalId != null;
  const urlBase = `/${
    isTerminal ? PREFIX_TERMINALS : PREFIX_STOPS
  }/${encodeURIComponent(
    params.terminalId ? params.terminalId : params.stopId,
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

  const uniqModesByRoutes = Array.from(new Set(modesByRoute)); // DT-3387
  const modeByRoutesOrStop =
    uniqModesByRoutes.length === 1 ? uniqModesByRoutes[0] : stop.vehicleMode; // DT-3387

  return (
    <div className="stop-page-content-wrapper">
      <div>
        <div className="stop-tab-container">
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
          >
            <div className="stop-tab-singletab-container">
              <div>
                <Icon
                  className="stop-page-tab_icon"
                  img="icon-icon_right-now"
                />
              </div>
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
          >
            <div className="stop-tab-singletab-container">
              <div>
                <Icon className="stop-page-tab_icon" img="icon-icon_schedule" />
              </div>
              <div>
                <FormattedMessage id="timetable" defaultMessage="timetable" />
              </div>
            </div>
          </Link>
          <Link
            to={`${urlBase}/${Tab.RoutesAndPlatforms}`}
            className={cx('stop-tab-singletab', {
              active: activeTab === Tab.RoutesAndPlatforms,
            })}
            onClick={() => {
              addAnalyticsEvent({
                category: 'Stop',
                action: 'OpenRoutesAndPlatformsTab',
                name: null,
              });
            }}
          >
            <div className="stop-tab-singletab-container">
              <div>
                <Icon className="stop-page-tab_icon" img="icon-icon_info" />
              </div>
              <div>
                <FormattedMessage
                  id={
                    modeByRoutesOrStop === 'RAIL' ||
                    modeByRoutesOrStop === 'SUBWAY'
                      ? 'routes-tracks'
                      : 'routes-platforms'
                  }
                  defaultMessage={
                    modeByRoutesOrStop === 'RAIL' ||
                    modeByRoutesOrStop === 'SUBWAY'
                      ? 'routes-tracks'
                      : 'routes-platforms'
                  }
                />
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
          >
            <div className="stop-tab-singletab-container">
              <div>
                <Icon
                  className={`stop-page-tab_icon ${disruptionClassName ||
                    `no-alerts`}`}
                  img={
                    disruptionClassName === 'active-disruption-alert'
                      ? 'icon-icon_caution'
                      : 'icon-icon_info'
                  }
                />
              </div>
              <div className={`${disruptionClassName || `no-alerts`}`}>
                <FormattedMessage id="disruptions" />
              </div>
            </div>
          </Link>
        </div>
        <div className="stop-tabs-fillerline" />
      </div>
      {children}
    </div>
  );
}

const alertArrayShape = PropTypes.arrayOf(
  PropTypes.shape({ alertSeverityLevel: PropTypes.string }),
);

StopPageTabContainer.propTypes = {
  children: PropTypes.node.isRequired,
  breakpoint: PropTypes.string.isRequired,
  params: PropTypes.oneOfType([
    PropTypes.shape({ stopId: PropTypes.string.isRequired }).isRequired,
    PropTypes.shape({ terminalId: PropTypes.string.isRequired }).isRequired,
  ]).isRequired,
  routes: PropTypes.arrayOf(
    PropTypes.shape({
      fullscreenMap: PropTypes.bool,
    }).isRequired,
  ).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  stop: PropTypes.shape({
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

StopPageTabContainer.defaultProps = {
  stop: undefined,
};

StopPageTabContainer.contextTypes = {
  intl: intlShape.isRequired,
};

const containerComponent = Relay.createContainer(
  withBreakpoint(StopPageTabContainer),
  {
    fragments: {
      stop: () => Relay.QL`
        fragment on Stop {
          ${StopAlertsWithContentQuery}
          vehicleMode
          stoptimes: stoptimesWithoutPatterns(
            startTime:$startTime,
            timeRange:$timeRange,
            numberOfDepartures:100,
            omitCanceled:false
          ) {
            realtimeState
            trip {
              pattern {
                code
              }
              route {
                gtfsId
                shortName
                longName
                mode
                color
                ${RouteAlertsWithContentQuery}
              }
            }
          }
          routes {
            gtfsId
            shortName
            longName
            mode
            color
            ${RouteAlertsWithContentQuery}
            patterns {
              code
            }
          }
        }
      `,
    },
    initialVariables: {
      startTime: moment().unix() - 60 * 5, // 5 mins in the past
      timeRange: 60 * 15, // -5 + 15 = 10 mins in the future
    },
  },
);

export { containerComponent as default, StopPageTabContainer as Component };
