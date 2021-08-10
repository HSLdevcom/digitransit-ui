import cx from 'classnames';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useState, useRef } from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
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
import Icon from './Icon';

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

function StopPageTabs({ stop }, { intl, match }) {
  const { router } = match;
  if (!stop) {
    return null;
  }
  const activeTab = getActiveTab(match.location.pathname);

  const [focusedTab, changeFocusedTab] = useState(activeTab);
  const rightNowTabRef = useRef();
  const timetableTabRef = useRef();
  const disruptionTabRef = useRef();
  const tabRefs = [rightNowTabRef, timetableTabRef, disruptionTabRef];

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
  let disruptionIcon;
  if (disruptionClassName === 'active-disruption-alert') {
    disruptionIcon = (
      <Icon
        className="disrution-icon"
        img="icon-icon_caution-no-excl-no-stroke"
      />
    );
  } else if (disruptionClassName === 'active-service-alert') {
    disruptionIcon = (
      <Icon className="service-alert-icon" img="icon-icon_info" />
    );
  }

  return (
    <div>
      {/* eslint-disable jsx-a11y/interactive-supports-focus */}
      <div
        className="stop-tab-container"
        role="tablist"
        onKeyDown={e => {
          const tabs = [Tab.RightNow, Tab.Timetable, Tab.Disruptions];
          const tabCount = tabs.length;
          const activeIndex = tabs.indexOf(focusedTab);
          let index;
          switch (e.nativeEvent.code) {
            case 'ArrowLeft':
              index = (activeIndex - 1 + tabCount) % tabCount;
              tabRefs[index].current.focus();
              changeFocusedTab(tabs[index]);
              break;
            case 'ArrowRight':
              index = (activeIndex + 1) % tabCount;
              tabRefs[index].current.focus();
              changeFocusedTab(tabs[index]);
              break;
            default:
              break;
          }
        }}
      >
        {/* eslint-enable jsx-a11y/interactive-supports-focus */}
        <button
          type="button"
          className={cx('stop-tab-singletab', {
            active: activeTab === Tab.RightNow,
          })}
          onClick={() => {
            router.replace(urlBase);
            addAnalyticsEvent({
              category: 'Stop',
              action: 'OpenRightNowTab',
              name: null,
            });
          }}
          role="tab"
          ref={rightNowTabRef}
          tabIndex={focusedTab === Tab.RightNow ? 0 : -1}
          aria-selected={activeTab === Tab.RightNow}
        >
          <div className="stop-tab-singletab-container">
            <div>
              <FormattedMessage id="right-now" defaultMessage="right now" />
            </div>
          </div>
        </button>
        <button
          type="button"
          className={cx('stop-tab-singletab', {
            active: activeTab === Tab.Timetable,
          })}
          onClick={() => {
            router.replace(`${urlBase}/${Tab.Timetable}`);
            addAnalyticsEvent({
              category: 'Stop',
              action: 'OpenTimetableTab',
              name: null,
            });
          }}
          role="tab"
          ref={timetableTabRef}
          tabIndex={focusedTab === Tab.Timetable ? 0 : -1}
          aria-selected={activeTab === Tab.Timetable}
        >
          <div className="stop-tab-singletab-container">
            <div>
              <FormattedMessage id="timetable" defaultMessage="timetable" />
            </div>
          </div>
        </button>
        <button
          type="button"
          className={cx('stop-tab-singletab', {
            active: activeTab === Tab.Disruptions,
            'alert-active': hasActiveAlert || stopRoutesWithAlerts.length > 0,
            'service-alert-active':
              hasActiveServiceAlerts || stopRoutesWithAlerts.length > 0,
          })}
          onClick={() => {
            router.replace(`${urlBase}/${Tab.Disruptions}`);
            addAnalyticsEvent({
              category: 'Stop',
              action: 'OpenDisruptionsTab',
              name: null,
            });
          }}
          role="tab"
          ref={disruptionTabRef}
          tabIndex={focusedTab === Tab.Disruptions ? 0 : -1}
          aria-selected={activeTab === Tab.Disruptions}
        >
          <div className="stop-tab-singletab-container">
            <div className={`${disruptionClassName || `no-alerts`}`}>
              {disruptionIcon}
              <FormattedMessage id="disruptions" />
            </div>
            <span className="sr-only">
              {disruptionClassName ? (
                <FormattedMessage id="disruptions-tab.sr-disruptions" />
              ) : (
                <FormattedMessage id="disruptions-tab.sr-no-disruptions" />
              )}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}

const alertArrayShape = PropTypes.arrayOf(
  PropTypes.shape({ alertSeverityLevel: PropTypes.string }),
);

StopPageTabs.propTypes = {
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
