import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage, intlShape } from 'react-intl';
import cx from 'classnames';
import sortBy from 'lodash/sortBy'; // DT-3182
import { routerShape } from 'react-router';

import Icon from './Icon';
import CallAgencyWarning from './CallAgencyWarning';
import FavouriteRouteContainer from './FavouriteRouteContainer';
import RoutePatternSelect from './RoutePatternSelect';
import RouteAgencyInfo from './RouteAgencyInfo';
import RouteNumber from './RouteNumber';
import { DATE_FORMAT, AlertSeverityLevelType } from '../constants';
import {
  startRealTimeClient,
  stopRealTimeClient,
  changeRealTimeClientTopics,
} from '../action/realTimeClientAction';
import {
  getCancelationsForRoute,
  getServiceAlertsForRoute,
  getServiceAlertsForRouteStops,
  isAlertActive,
  getActiveAlertSeverityLevel,
  getServiceAlertsForStop,
  getCancelationsForStop,
  getServiceAlertsForStopRoutes,
} from '../util/alertUtils';
import {
  PREFIX_DISRUPTION,
  PREFIX_ROUTES,
  PREFIX_STOPS,
  PREFIX_TIMETABLE,
} from '../util/path';
import withBreakpoint from '../util/withBreakpoint';
import {
  RouteAlertsQuery,
  StopAlertsWithContentQuery,
} from '../util/alertQueries';
import { addAnalyticsEvent } from '../util/analyticsUtils';

const Tab = {
  Disruptions: PREFIX_DISRUPTION,
  Stops: PREFIX_STOPS,
  Timetable: PREFIX_TIMETABLE,
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

class RoutePage extends React.Component {
  static contextTypes = {
    getStore: PropTypes.func.isRequired,
    executeAction: PropTypes.func.isRequired,
    router: routerShape.isRequired,
    intl: intlShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    route: PropTypes.object.isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
    }).isRequired,
    params: PropTypes.shape({
      patternId: PropTypes.string.isRequired,
    }).isRequired,
    breakpoint: PropTypes.string.isRequired,
  };

  // gets called if pattern has not been visited before
  componentDidMount() {
    const { params, route } = this.props;
    const { config, executeAction, router } = this.context; // DT-3182: added router for changing URL
    if (!route || !route.patterns) {
      return;
    }

    const { location } = router;

    const lengthPathName =
      location !== undefined ? location.pathname.length : 0; // DT-3331
    const lengthIndexOfPattern =
      location !== undefined
        ? location.pathname.indexOf(params.patternId) + params.patternId.length
        : 0; // DT-3331
    const noSortFound =
      location !== undefined
        ? location.search.indexOf('sort=no') !== -1
        : false; // DT-3331
    const reRouteAllowed =
      lengthPathName === lengthIndexOfPattern && !noSortFound; // DT-3331

    let sortedPatternsByCountOfTrips;
    const tripsExists = route.patterns ? 'trips' in route.patterns[0] : false;

    // DT-3331 added reRouteAllowed
    if (tripsExists && reRouteAllowed) {
      sortedPatternsByCountOfTrips = sortBy(
        sortBy(route.patterns, 'code').reverse(),
        'trips.length',
      ).reverse();
    }
    const pattern =
      sortedPatternsByCountOfTrips !== undefined
        ? sortedPatternsByCountOfTrips[0]
        : route.patterns.find(({ code }) => code === params.patternId);

    if (!pattern) {
      return;
    }

    // DT-3182: call this only 1st time for changing URL to wanted route (most trips)
    // DT-3331: added reRouteAllowed
    if (
      location !== undefined &&
      location.action === 'PUSH' &&
      params.patternId !== pattern.code &&
      reRouteAllowed
    ) {
      router.replace(
        decodeURIComponent(location.pathname).replace(
          new RegExp(`${params.patternId}(.*)`),
          pattern.code,
        ),
      );
      return;
    }

    const { realTime } = config;

    if (!realTime) {
      return;
    }

    const routeParts = route.gtfsId.split(':');
    const agency = routeParts[0];
    const source = realTime[agency];
    if (!source || !source.active) {
      return;
    }

    const id =
      sortedPatternsByCountOfTrips !== undefined &&
      pattern.code !== params.patternId
        ? routeParts[1]
        : source.routeSelector(this.props);

    executeAction(startRealTimeClient, {
      ...source,
      agency,
      options: [
        {
          route: id,
          // add some information from the context
          // to compensate potentially missing feed data
          mode: route.mode.toLowerCase(),
          gtfsId: routeParts[1],
          headsign: pattern.headsign,
        },
      ],
    });
  }

  componentWillUnmount() {
    const { client } = this.context.getStore('RealTimeInformationStore');
    if (client) {
      this.context.executeAction(stopRealTimeClient, client);
    }
  }

  onPatternChange = newPattern => {
    addAnalyticsEvent({
      category: 'Route',
      action: 'ToggleDirection',
      name: null,
    });
    const { location, params, route } = this.props;
    const { config, executeAction, getStore, router } = this.context;
    const { client, topics } = getStore('RealTimeInformationStore');

    // if config contains mqtt feed and old client has not been removed
    if (client) {
      const { realTime } = config;
      const routeParts = route.gtfsId.split(':');
      const agency = routeParts[0];
      const source = realTime[agency];

      const pattern = route.patterns.find(({ code }) => code === newPattern);
      if (pattern) {
        const id = source.routeSelector(this.props);
        executeAction(changeRealTimeClientTopics, {
          ...source,
          agency,
          options: [
            {
              route: id,
              mode: route.mode.toLowerCase(),
              gtfsId: routeParts[1],
              headsign: pattern.headsign,
            },
          ],
          oldTopics: topics,
          client,
        });
      }
    }

    router.replace(
      decodeURIComponent(location.pathname).replace(
        new RegExp(`${params.patternId}(.*)`),
        newPattern,
      ),
    );
  };

  changeTab = tab => {
    const path = `/${PREFIX_ROUTES}/${this.props.route.gtfsId}/${tab}/${this
      .props.params.patternId || ''}`;
    this.context.router.replace(path);
    let action;
    switch (tab) {
      case PREFIX_TIMETABLE:
        action = 'OpenTimetableTab';
        break;
      case PREFIX_STOPS:
        action = 'OpenStopsTab';
        break;
      case PREFIX_DISRUPTION:
        action = 'OpenDisruptionsTab';
        break;
      default:
        action = 'Unknown';
        break;
    }
    addAnalyticsEvent({
      category: 'Route',
      action,
      name: null,
    });
  };

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/anchor-is-valid */
  render() {
    const { breakpoint, location, params, route } = this.props;
    const { patternId } = params;
    const { config, router } = this.context;

    if (route == null) {
      /* In this case there is little we can do
       * There is no point continuing rendering as it can only
       * confuse user. Therefore redirect to Routes page */
      router.replace(`/${PREFIX_ROUTES}`);
      return null;
    }

    const activeTab = getActiveTab(location.pathname);
    const currentTime = moment().unix();
    const hasActiveAlert = isAlertActive(
      getCancelationsForRoute(route, patternId),
      [
        ...getServiceAlertsForRoute(route, patternId),
        ...getServiceAlertsForRouteStops(route, patternId),
      ],
      currentTime,
    );

    const routePatternStopAlerts = [];

    if (route.patterns && route.patterns.length > 0) {
      route.patterns.forEach(
        pattern =>
          pattern.stops &&
          pattern.stops.forEach(stop => {
            return (
              getActiveAlertSeverityLevel(
                [
                  ...getCancelationsForStop(stop),
                  ...getServiceAlertsForStop(stop),
                  ...getServiceAlertsForStopRoutes(stop),
                ],
                currentTime,
              ) && routePatternStopAlerts.push(...stop.alerts)
            );
          }),
      );
    }

    const hasActiveServiceAlerts = getActiveAlertSeverityLevel(
      getServiceAlertsForRoute(route, patternId),
      currentTime,
    );

    const disruptionClassName =
      ((hasActiveAlert ||
        routePatternStopAlerts.find(
          alert =>
            alert.severityLevel ===
            (AlertSeverityLevelType.Severe || AlertSeverityLevelType.Warning),
        )) &&
        'active-disruption-alert') ||
      ((hasActiveServiceAlerts ||
        routePatternStopAlerts.find(
          alert =>
            alert.severityLevel !==
            (AlertSeverityLevelType.Severe || AlertSeverityLevelType.Warning),
        )) &&
        'active-service-alert');

    const useCurrentTime = activeTab === Tab.Stops; // DT-3182

    return (
      <div>
        <div className="header-for-printing">
          <h1>
            <FormattedMessage
              id="print-route-app-title"
              defaultMessage={config.title}
            />
            {` - `}
            <FormattedMessage id="route-guide" defaultMessage="Route guide" />
          </h1>
        </div>
        {route.type === 715 && <CallAgencyWarning route={route} />}
        <div className="tabs route-tabs">
          <nav
            className={cx('tabs-navigation', {
              'bp-large': breakpoint === 'large',
            })}
          >
            {breakpoint === 'large' && (
              <RouteNumber
                color={route.color ? `#${route.color}` : null}
                mode={route.mode}
                text={route.shortName}
                isRouteView
              />
            )}
            <a
              className={cx({ 'is-active': activeTab === Tab.Stops })}
              onClick={() => {
                this.changeTab(Tab.Stops);
              }}
            >
              <div>
                <Icon img="icon-icon_bus-stop" />
                <FormattedMessage id="stops" defaultMessage="Stops" />
              </div>
            </a>
            <a
              className={cx({ 'is-active': activeTab === Tab.Timetable })}
              onClick={() => {
                this.changeTab(Tab.Timetable);
              }}
            >
              <div>
                <Icon img="icon-icon_schedule" />
                <FormattedMessage id="timetable" defaultMessage="Timetable" />
              </div>
            </a>
            <a
              className={cx({
                activeAlert: hasActiveAlert,
                'is-active': activeTab === Tab.Disruptions,
              })}
              onClick={() => {
                this.changeTab(Tab.Disruptions);
              }}
            >
              <div
                className={`tab-route-disruption ${disruptionClassName ||
                  `no-alerts`}`}
              >
                <Icon
                  className={`route-page-tab_icon ${disruptionClassName ||
                    `no-alerts`}`}
                  img={hasActiveAlert ? 'icon-icon_caution' : 'icon-icon_info'}
                />
                <FormattedMessage
                  id="disruptions"
                  defaultMessage="Disruptions"
                />
              </div>
            </a>
            <FavouriteRouteContainer
              className="route-page-header"
              gtfsId={route.gtfsId}
            />
          </nav>
          {patternId && (
            <RoutePatternSelect
              params={params}
              route={route}
              onSelectChange={this.onPatternChange}
              gtfsId={route.gtfsId}
              className={cx({ 'bp-large': breakpoint === 'large' })}
              useCurrentTime={useCurrentTime}
            />
          )}
          <RouteAgencyInfo route={route} />
        </div>
      </div>
    );
  }
}

// DT-2531: added activeDates
const containerComponent = Relay.createContainer(withBreakpoint(RoutePage), {
  fragments: {
    route: () =>
      Relay.QL`
      fragment on Route {
        gtfsId
        color
        shortName
        longName
        mode
        type
        ${RouteAgencyInfo.getFragment('route')}
        ${RoutePatternSelect.getFragment('route')}
        ${RouteAlertsQuery}
        agency {
          phone
        }
        patterns {
          headsign
          code
          stops {
            ${StopAlertsWithContentQuery}
          }
          trips: tripsForDate(serviceDate: $serviceDay) {
            stoptimes: stoptimesForDate(serviceDate: $serviceDay) {
              realtimeState
              scheduledArrival
              scheduledDeparture
              serviceDay
            }
          }
          activeDates: trips {
            day: activeDates
          }
        }
      }
    `,
  },
  initialVariables: {
    serviceDay: moment().format(DATE_FORMAT),
  },
});

export { containerComponent as default, RoutePage as Component };
