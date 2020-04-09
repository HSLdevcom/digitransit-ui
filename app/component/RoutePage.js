import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage, intlShape } from 'react-intl';
import cx from 'classnames';
import sortBy from 'lodash/sortBy'; // DT-3182
import { matchShape, routerShape } from 'found';

import Icon from './Icon';
import CallAgencyWarning from './CallAgencyWarning';
import FavouriteRouteContainer from './FavouriteRouteContainer';
import RoutePatternSelect from './RoutePatternSelect';
import RouteAgencyInfo from './RouteAgencyInfo';
import RouteNumber from './RouteNumber';
import { AlertSeverityLevelType } from '../constants';
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
import { PREFIX_DISRUPTION, PREFIX_ROUTES, PREFIX_STOPS } from '../util/path';
import withBreakpoint from '../util/withBreakpoint';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import BackButton from './BackButton'; // DT-3472

const Tab = {
  Disruptions: PREFIX_DISRUPTION,
  Stops: PREFIX_STOPS,
  Timetable: 'aikataulu',
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
    intl: intlShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    route: PropTypes.object.isRequired,
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    breakpoint: PropTypes.string.isRequired,
  };

  // gets called if pattern has not been visited before
  componentDidMount() {
    const { match, router, route } = this.props;
    const { config, executeAction } = this.context;
    if (!route || !route.patterns) {
      return;
    }

    const { location } = match;

    const lengthPathName =
      location !== undefined ? location.pathname.length : 0; // DT-3331
    const lengthIndexOfPattern =
      location !== undefined
        ? location.pathname.indexOf(match.params.patternId) +
          match.params.patternId.length
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
        : route.patterns.find(({ code }) => code === match.params.patternId);

    if (!pattern) {
      return;
    }

    // DT-3182: call this only 1st time for changing URL to wanted route (most trips)
    // DT-3331: added reRouteAllowed
    if (
      location !== undefined &&
      location.action === 'PUSH' &&
      match.params.patternId !== pattern.code &&
      reRouteAllowed
    ) {
      router.replace(
        decodeURIComponent(location.pathname).replace(
          new RegExp(`${match.params.patternId}(.*)`),
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
      pattern.code !== match.params.patternId
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
    const { match, router, route } = this.props;
    const { config, executeAction, getStore } = this.context;
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
      decodeURIComponent(match.location.pathname).replace(
        new RegExp(`${match.params.patternId}(.*)`),
        newPattern,
      ),
    );
  };

  changeTab = tab => {
    const path = `/${PREFIX_ROUTES}/${this.props.route.gtfsId}/${tab}/${this
      .props.match.params.patternId || ''}`;
    this.props.router.replace(path);
    let action;
    switch (tab) {
      case 'aikataulu':
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
    const { breakpoint, match, router, route } = this.props;
    const { patternId } = match.params;
    const { config } = this.context;

    if (route == null) {
      /* In this case there is little we can do
       * There is no point continuing rendering as it can only
       * confuse user. Therefore redirect to Routes page */
      router.replace(`/${PREFIX_ROUTES}`);
      return null;
    }

    const activeTab = getActiveTab(match.location.pathname);
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
              <BackButton
                icon="icon-icon_arrow-collapse--left"
                color={config.colors.primary}
                iconClassName="arrow-icon"
                customStyle={{ paddingTop: '25px' }}
              />
            )}
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
              params={match.params}
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
const containerComponent = createFragmentContainer(withBreakpoint(RoutePage), {
  route: graphql`
    fragment RoutePage_route on Route
      @argumentDefinitions(date: { type: "String" }) {
      gtfsId
      color
      shortName
      longName
      mode
      type
      ...RouteAgencyInfo_route
      ...RoutePatternSelect_route @arguments(date: $date)
      alerts {
        alertSeverityLevel
        effectiveEndDate
        effectiveStartDate
        trip {
          pattern {
            code
          }
        }
      }
      agency {
        phone
      }
      patterns {
        headsign
        code
        stops {
          id
          gtfsId
          code
          alerts {
            id
            alertDescriptionText
            alertHash
            alertHeaderText
            alertSeverityLevel
            alertUrl
            effectiveEndDate
            effectiveStartDate
            alertDescriptionTextTranslations {
              language
              text
            }
            alertHeaderTextTranslations {
              language
              text
            }
            alertUrlTranslations {
              language
              text
            }
          }
        }
        trips: tripsForDate(serviceDay: $date) {
          stoptimes: stoptimesForDate(serviceDay: $date) {
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
});

export { containerComponent as default, RoutePage as Component };
