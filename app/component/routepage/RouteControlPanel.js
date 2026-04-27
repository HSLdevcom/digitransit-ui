/* eslint-disable import/no-unresolved */
import { DateTime } from 'luxon';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import cx from 'classnames';
import sortBy from 'lodash/sortBy';
import { matchShape } from 'found';
import { enrichPatterns } from '@digitransit-util/digitransit-util';
import { useConfigContext } from '../../configurations/ConfigContext';
import RoutePatternSelectContainer from './RoutePatternSelectContainer';
import { DATE_FORMAT, ExtendedRouteTypes } from '../../constants';
import {
  startRealTimeClient,
  stopRealTimeClient,
  changeRealTimeClientTopics,
} from '../../action/realTimeClientAction';
import {
  getCancelationsForRoute,
  getAlertsForObject,
  checkActiveDisruptions,
  getActiveAlertSeverityLevel,
} from '../../util/alertUtils';
import { isActiveDate } from '../../util/patternUtils';
import {
  routePagePath,
  PREFIX_DISRUPTION,
  PREFIX_STOPS,
  PREFIX_TIMETABLE,
} from '../../util/path';
import { addAnalyticsEvent } from '../../util/analyticsUtils';
import { isIOS } from '../../util/browser';
import { unixTime, unixToYYYYMMDD } from '../../util/timeUtils';
import { saveSearch } from '../../action/SearchActions';
import Icon from '../Icon';
import Notification from './Notification';

const Tab = {
  Disruptions: PREFIX_DISRUPTION,
  Stops: PREFIX_STOPS,
  Timetable: PREFIX_TIMETABLE,
};

/**
 * Determines if a route supports full control panel features
 * (pattern selection, timetables, stops tabs).
 */
const showStandardControls = route => {
  return route.type !== ExtendedRouteTypes.CallAgency;
};

const getActiveTab = pathname => {
  if (pathname.indexOf(`/${Tab.Disruptions}`) > -1) {
    return Tab.Disruptions;
  }
  if (pathname.indexOf(`/${Tab.Stops}`) > -1) {
    return Tab.Stops;
  }
  if (pathname.indexOf(`/${Tab.Timetable}`) > -1) {
    return Tab.Timetable;
  }
  return undefined;
};

const TAB_ANALYTICS_ACTIONS = {
  [PREFIX_TIMETABLE]: 'OpenTimetableTab',
  [PREFIX_STOPS]: 'OpenStopsTab',
  [PREFIX_DISRUPTION]: 'OpenDisruptionsTab',
};

function RouteControlPanel(
  {
    route,
    match,
    breakpoint,
    noInitialServiceDay = false,
    tripStartTime = undefined,
  },
  { getStore, executeAction },
) {
  const config = useConfigContext();
  const intl = useIntl();
  const { location, params, router } = match;
  const { patternId } = params;

  const [focusedTab, setFocusedTab] = useState(getActiveTab(location.pathname));

  const stopTabRef = useRef(null);
  const timetableTabRef = useRef(null);
  const disruptionTabRef = useRef(null);
  const tabRefMap = {
    [Tab.Stops]: stopTabRef,
    [Tab.Timetable]: timetableTabRef,
    [Tab.Disruptions]: disruptionTabRef,
  };

  const routeNotifications = [];
  if (
    config.NODE_ENV !== 'test' &&
    config.routeNotifications &&
    config.routeNotifications.length > 0
  ) {
    for (let i = 0; i < config.routeNotifications.length; i++) {
      const n = config.routeNotifications[i];
      if (n.showForRoute?.(route)) {
        routeNotifications.push(
          <Notification notification={n} lang={intl.locale} key={n.id} />,
        );
      }
    }
  }

  const activeTab = getActiveTab(location.pathname);

  // Focus the active tab on mount for correct screen-reader cursor placement
  // after SPA tab navigation (per WCAG APG roving tabindex pattern).
  // Skip when RoutePage has already moved focus to the page heading (initial
  // page load): in that case activeElement is the heading, not document.body.
  // After a tab switch the old tab button is removed from the DOM, so the
  // browser resets focus to document.body — that is when we take over.
  useEffect(() => {
    if (document.activeElement && document.activeElement !== document.body) {
      return;
    }
    const activeRef = activeTab && tabRefMap[activeTab];
    if (activeRef?.current) {
      activeRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (route?.patterns && !noInitialServiceDay) {
      if (isIOS && location.query?.save) {
        executeAction(saveSearch, {
          item: {
            properties: {
              mode: route.mode,
              gtfsId: route.gtfsId,
              longName: route.longName,
              shortName: route.shortName,
              layer: `route-${route.mode}`,
              link: location.pathname,
              agency: { name: route.agency.name },
            },
            type: 'Route',
          },
          type: 'search',
        });
      }

      // Sort by most trips descending; for equal trip counts, sort by code descending as tiebreak.
      const sortedPatternsByCountOfTrips =
        'trips' in route.patterns[0]
          ? sortBy(
              sortBy(route.patterns, 'code').reverse(),
              'trips.length',
            ).reverse()
          : undefined;

      const selectedPattern =
        sortedPatternsByCountOfTrips?.find(
          sorted => sorted.code === patternId,
        ) ?? route.patterns.find(({ code }) => code === patternId);

      if (selectedPattern) {
        if (params.type === PREFIX_TIMETABLE) {
          const enrichedPattern = enrichPatterns(
            [selectedPattern],
            false,
            config.itinerary.serviceTimeRange,
          );
          const isSameWeek = DateTime.fromFormat(
            enrichedPattern[0].minAndMaxDate[0],
            DATE_FORMAT,
          ).hasSame(DateTime.now(), 'week');
          if (
            location.search.indexOf('serviceDay') === -1 ||
            (location.query.serviceDay &&
              Number(location.query.serviceDay) <
                Number(enrichedPattern[0].minAndMaxDate[0]))
          ) {
            const serviceDay = isSameWeek
              ? enrichedPattern[0].minAndMaxDate[0]
              : enrichedPattern[0].activeDates[0];
            router.replace(
              `${decodeURIComponent(
                location.pathname,
              )}?serviceDay=${serviceDay}`,
            );
          }
        }

        const { realTime } = config;
        if (realTime && process.env.NODE_ENV !== 'test') {
          const routeParts = route.gtfsId.split(':');
          const feedId = routeParts[0];
          const source = realTime[feedId];
          if (source?.active && isActiveDate(selectedPattern)) {
            const id = source.routeSelector({ route, match, tripStartTime });
            const patternIdSplit = patternId.split(':');
            const direction = patternIdSplit[patternIdSplit.length - 2];
            executeAction(startRealTimeClient, {
              ...source,
              feedId,
              options: [
                {
                  route: id,
                  feedId,
                  mode: route.mode.toLowerCase(),
                  gtfsId: routeParts[1],
                  headsign: selectedPattern?.headsign,
                  direction,
                  tripStartTime,
                },
              ],
            });
          }
        }
      }
    }

    return () => {
      const { client } = getStore('RealTimeInformationStore');
      if (client) {
        executeAction(stopRealTimeClient, client);
      }
    };
  }, []);

  const onPatternChange = newPattern => {
    addAnalyticsEvent({
      category: 'Route',
      action: 'ToggleDirection',
      name: null,
    });
    const { client, topics } = getStore('RealTimeInformationStore');
    const { type } = params;

    const pattern =
      type === PREFIX_TIMETABLE
        ? enrichPatterns(
            route.patterns.filter(x => x.code === newPattern),
            false,
            config.itinerary.serviceTimeRange,
          )
        : route.patterns.filter(x => x.code === newPattern);
    const isActivePattern = isActiveDate(pattern[0]);

    const routeParts = route.gtfsId.split(':');
    const feedId = routeParts[0];
    // if config contains mqtt feed and old client has not been removed
    if (client) {
      const { realTime } = config;
      const source = realTime[feedId];

      if (isActivePattern) {
        const id = source.routeSelector({ route, match, tripStartTime });
        executeAction(changeRealTimeClientTopics, {
          ...source,
          feedId,
          options: [
            {
              route: id,
              feedId,
              mode: route.mode.toLowerCase(),
              gtfsId: routeParts[1],
              headsign: pattern[0].headsign,
            },
          ],
          oldTopics: topics,
          client,
        });
      } else {
        // Close MQTT — we don't want to show vehicles when pattern is in future / past
        executeAction(stopRealTimeClient, client);
      }
    } else if (isActivePattern) {
      const { realTime } = config;
      if (realTime && process.env.NODE_ENV !== 'test') {
        const source = realTime[feedId];
        if (source?.active) {
          const id =
            pattern[0].code !== patternId
              ? routeParts[1]
              : source.routeSelector({ route, match, tripStartTime });
          const patternIdSplit = patternId.split(':');
          const direction = patternIdSplit[patternIdSplit.length - 2];
          executeAction(startRealTimeClient, {
            ...source,
            feedId,
            options: [
              {
                route: id,
                feedId,
                mode: route.mode.toLowerCase(),
                gtfsId: routeParts[1],
                headsign: pattern[0].headsign,
                direction,
                tripStartTime,
              },
            ],
          });
        }
      }
    }

    let newPath = routePagePath(route.gtfsId, type || PREFIX_STOPS, newPattern);
    if (type === PREFIX_TIMETABLE) {
      const today = unixToYYYYMMDD(unixTime(), config);
      if (location.query?.serviceDay) {
        newPath += `?serviceDay=${location.query.serviceDay}`;
      } else if (
        pattern[0].minAndMaxDate &&
        today < pattern[0].minAndMaxDate[0]
      ) {
        newPath += `?serviceDay=${pattern[0].minAndMaxDate[0]}`;
      }
    }
    router.replace(newPath);
  };

  const changeTab = tab => {
    const path = routePagePath(route.gtfsId, tab, patternId);
    router.replace(path);
    addAnalyticsEvent({
      category: 'Route',
      action: TAB_ANALYTICS_ACTIONS[tab] ?? 'Unknown',
      name: null,
    });
  };

  const handleTabKeyDown = e => {
    const tabs = [Tab.Stops, Tab.Timetable, Tab.Disruptions];
    const currentIndex = tabs.indexOf(focusedTab);
    let nextTab;
    switch (e.nativeEvent.code) {
      case 'ArrowLeft':
        nextTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
        break;
      case 'ArrowRight':
        nextTab = tabs[(currentIndex + 1) % tabs.length];
        break;
      default:
        return;
    }
    tabRefMap[nextTab].current.focus();
    setFocusedTab(nextTab);
  };

  const currentTime = unixTime();
  const selectedPattern = route?.patterns?.find(p => p.code === patternId);
  const hasActiveAlert = checkActiveDisruptions(
    currentTime,
    getCancelationsForRoute(
      route,
      patternId,
      currentTime,
      config.routeCancelationAlertValidity,
    ),
    getAlertsForObject(selectedPattern),
  );

  const hasActiveServiceAlerts = getActiveAlertSeverityLevel(
    getAlertsForObject(selectedPattern),
    currentTime,
  );

  const disruptionClassName =
    (hasActiveAlert && 'active-disruption-alert') ||
    (hasActiveServiceAlerts && 'active-service-alert');

  const countOfButtons = 3;

  let disruptionIcon;
  if (hasActiveAlert) {
    disruptionIcon = (
      <Icon
        img="icon_caution-no-excl-no-stroke"
        color={config.colors.caution}
      />
    );
  } else if (hasActiveServiceAlerts) {
    disruptionIcon = <Icon className="service-alert-icon" img="icon_info" />;
  }

  return (
    <div
      className={cx('route-page-control-panel-container', activeTab, {
        'bp-large': breakpoint === 'large',
      })}
    >
      <div className="header-for-printing">
        <h1>
          {config.title}
          {` - `}
          <FormattedMessage id="route-guide" defaultMessage="Route guide" />
        </h1>
      </div>
      <div
        className={cx('route-control-panel', {
          'bp-large': breakpoint === 'large',
        })}
      >
        {!config.showNewRoutePage && routeNotifications}
        {showStandardControls(route) && (
          <>
            {patternId && (
              <RoutePatternSelectContainer
                match={match}
                route={route}
                onSelectChange={onPatternChange}
                gtfsId={route.gtfsId}
                className={cx({ 'bp-large': breakpoint === 'large' })}
              />
            )}
            <div className="route-tabs" role="tablist">
              <button
                type="button"
                className={cx({ 'is-active': activeTab === Tab.Stops })}
                onClick={() => changeTab(Tab.Stops)}
                onKeyDown={handleTabKeyDown}
                tabIndex={activeTab === Tab.Stops ? 0 : -1}
                role="tab"
                id="route-stop-tab"
                ref={stopTabRef}
                aria-selected={activeTab === Tab.Stops}
                style={{ '--totalCount': `${countOfButtons}` }}
              >
                <div>
                  <FormattedMessage id="stops" defaultMessage="Stops" />
                </div>
              </button>
              <button
                type="button"
                className={cx({ 'is-active': activeTab === Tab.Timetable })}
                onClick={() => changeTab(Tab.Timetable)}
                onKeyDown={handleTabKeyDown}
                tabIndex={activeTab === Tab.Timetable ? 0 : -1}
                role="tab"
                id="route-timetable-tab"
                ref={timetableTabRef}
                aria-selected={activeTab === Tab.Timetable}
                style={{ '--totalCount': `${countOfButtons}` }}
              >
                <div>
                  <FormattedMessage id="timetable" defaultMessage="Timetable" />
                </div>
              </button>
              <button
                type="button"
                className={cx({
                  activeAlert: hasActiveAlert,
                  'is-active': activeTab === Tab.Disruptions,
                })}
                onClick={() => changeTab(Tab.Disruptions)}
                onKeyDown={handleTabKeyDown}
                tabIndex={activeTab === Tab.Disruptions ? 0 : -1}
                role="tab"
                id="route-disruption-tab"
                ref={disruptionTabRef}
                aria-selected={activeTab === Tab.Disruptions}
                aria-label={`${intl.formatMessage({
                  id: 'disruptions',
                })}: ${intl.formatMessage({
                  id: disruptionClassName
                    ? 'disruptions-tab.sr-disruptions'
                    : 'disruptions-tab.sr-no-disruptions',
                })}`}
                style={{ '--totalCount': `${countOfButtons}` }}
              >
                <div
                  className={`tab-route-disruption ${
                    disruptionClassName || `no-alerts`
                  }`}
                >
                  {disruptionIcon}
                  <FormattedMessage
                    id="disruptions"
                    defaultMessage="Disruptions"
                  />
                </div>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

RouteControlPanel.propTypes = {
  route: PropTypes.shape({
    mode: PropTypes.string.isRequired,
    gtfsId: PropTypes.string.isRequired,
    longName: PropTypes.string,
    shortName: PropTypes.string,
    patterns: PropTypes.arrayOf(PropTypes.shape({})),
    type: PropTypes.number,
    agency: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  match: matchShape.isRequired,
  breakpoint: PropTypes.string.isRequired,
  noInitialServiceDay: PropTypes.bool,
  tripStartTime: PropTypes.string,
};

RouteControlPanel.contextTypes = {
  getStore: PropTypes.func.isRequired,
  executeAction: PropTypes.func.isRequired,
};

const connectedComponent = RouteControlPanel;

export { connectedComponent as default, RouteControlPanel as Component };
