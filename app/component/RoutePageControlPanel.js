/* eslint-disable import/no-unresolved */
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import cx from 'classnames';
import sortBy from 'lodash/sortBy'; // DT-3182
import { matchShape, routerShape } from 'found';
import { enrichPatterns } from '@digitransit-util/digitransit-util';
import CallAgencyWarning from './CallAgencyWarning';
import RoutePatternSelect from './RoutePatternSelect';
import { AlertSeverityLevelType, DATE_FORMAT } from '../constants';
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
import { isActiveDate } from '../util/patternUtils';
import {
  PREFIX_DISRUPTION,
  PREFIX_ROUTES,
  PREFIX_STOPS,
  PREFIX_TIMETABLE,
} from '../util/path';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { isIOS } from '../util/browser';
import { saveSearch } from '../action/SearchActions';
import Icon from './Icon';

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

class RoutePageControlPanel extends React.Component {
  static contextTypes = {
    getStore: PropTypes.func.isRequired,
    executeAction: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    route: PropTypes.object.isRequired,
    match: matchShape.isRequired,
    breakpoint: PropTypes.string.isRequired,
    noInitialServiceDay: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      focusedTab: getActiveTab(props.match.location.pathname),
    };
    this.stopTabRef = React.createRef();
    this.timetableTabRef = React.createRef();
    this.disruptionTabRef = React.createRef();
    this.tabRefs = [
      this.stopTabRef,
      this.timetableTabRef,
      this.disruptionTabRef,
    ];
  }

  // gets called if pattern has not been visited before
  componentDidMount() {
    const { match, route, noInitialServiceDay } = this.props;
    const { config, router } = this.context;
    const { location } = match;

    if (!route || !route.patterns) {
      return;
    }

    if (noInitialServiceDay) {
      return;
    }

    if (isIOS && location.query.save) {
      this.context.executeAction(saveSearch, {
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

    let sortedPatternsByCountOfTrips;
    const tripsExists = route.patterns ? 'trips' in route.patterns[0] : false;

    if (tripsExists) {
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

    const selectedPattern = sortedPatternsByCountOfTrips?.find(
      sorted => sorted.code === match.params.patternId,
    );

    if (match.params.type === PREFIX_TIMETABLE) {
      const enrichedPattern = enrichPatterns(
        [selectedPattern],
        false,
        this.context.config.itinerary.serviceTimeRange,
      );
      const isSameWeek =
        moment(enrichedPattern[0].minAndMaxDate[0])
          .startOf('isoWeek')
          .format(DATE_FORMAT) ===
        moment().startOf('isoWeek').format(DATE_FORMAT);
      if (
        location.search.indexOf('serviceDay') === -1 ||
        (location.query.serviceDay &&
          Number(location.query.serviceDay) <
            Number(enrichedPattern[0].minAndMaxDate[0]))
      ) {
        if (isSameWeek) {
          router.replace(
            `${decodeURIComponent(match.location.pathname)}?serviceDay=${
              enrichedPattern[0].minAndMaxDate[0]
            }`,
          );
        } else {
          router.replace(
            `${decodeURIComponent(match.location.pathname)}?serviceDay=${
              enrichedPattern[0].activeDates[0]
            }`,
          );
        }
      }
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
    // DT-4161: Start real time client if current day is in active days
    if (isActiveDate(selectedPattern)) {
      this.startClient(selectedPattern);
    }
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
    const { match, route } = this.props;
    const { config, executeAction, getStore, router } = this.context;
    const { client, topics } = getStore('RealTimeInformationStore');
    const { type } = match.params;

    const pattern =
      type === PREFIX_TIMETABLE
        ? enrichPatterns(
            route.patterns.filter(x => x.code === newPattern),
            false,
            this.context.config.itinerary.serviceTimeRange,
          )
        : route.patterns.filter(x => x.code === newPattern);

    const isActivePattern = isActiveDate(pattern);

    // if config contains mqtt feed and old client has not been removed
    if (client) {
      const { realTime } = config;
      const routeParts = route.gtfsId.split(':');
      const agency = routeParts[0];
      const source = realTime[agency];

      if (isActivePattern) {
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
      } else {
        //  Close MQTT, we don't want to show vehicles when pattern is in future / past
        executeAction(stopRealTimeClient, client);
      }
    } else if (isActivePattern) {
      this.startClient(pattern);
    }

    let newPathname = decodeURIComponent(match.location.pathname).replace(
      new RegExp(`${match.params.patternId}(.*)`),
      newPattern,
    );
    if (type === PREFIX_TIMETABLE) {
      if (
        pattern[0].minAndMaxDate &&
        moment().isBefore(pattern[0].minAndMaxDate[0])
      ) {
        newPathname += `?serviceDay=${pattern[0].minAndMaxDate[0]}`;
      }
      if (match.query && match.query.serviceDay) {
        newPathname += `?serviceDay=${match.query.serviceDay}`;
      }
    }
    router.replace(newPathname);
  };

  startClient(pattern) {
    const { config, executeAction } = this.context;
    const { match, route } = this.props;
    const { realTime } = config;

    if (!realTime) {
      return;
    }

    const routeParts = route.gtfsId.split(':');
    const agency = routeParts[0];
    const source = realTime[agency];
    const id =
      pattern.code !== match.params.patternId
        ? routeParts[1]
        : source.routeSelector(this.props);
    if (!source || !source.active) {
      return;
    }

    const patternIdSplit = match.params.patternId.split(':');
    const direction = patternIdSplit[patternIdSplit.length - 2];
    const directionInt = parseInt(direction, 10);

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
          directionInt,
        },
      ],
    });
  }

  changeTab = tab => {
    const path = `/${PREFIX_ROUTES}/${this.props.route.gtfsId}/${tab}/${
      this.props.match.params.patternId || ''
    }`;
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
    const { breakpoint, match, route } = this.props;
    const { patternId } = match.params;
    const { config } = this.context;

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
    const countOfButtons = 3;
    const isOnDemandTaxi = route.type === 715;

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
        {isOnDemandTaxi && <CallAgencyWarning route={route} />}
        <div
          className={cx('route-control-panel', {
            'bp-large': breakpoint === 'large',
          })}
          aria-live="polite"
        >
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
          {/* eslint-disable jsx-a11y/interactive-supports-focus */}
          <div
            className="route-tabs"
            role="tablist"
            onKeyDown={e => {
              const tabs = [Tab.Stops, Tab.Timetable, Tab.Disruptions];
              const tabCount = tabs.length;
              const activeIndex = tabs.indexOf(this.state.focusedTab);
              let index;
              switch (e.nativeEvent.code) {
                case 'ArrowLeft':
                  index = (activeIndex - 1 + tabCount) % tabCount;
                  this.tabRefs[index].current.focus();
                  this.setState({ focusedTab: tabs[index] });
                  break;
                case 'ArrowRight':
                  index = (activeIndex + 1) % tabCount;
                  this.tabRefs[index].current.focus();
                  this.setState({ focusedTab: tabs[index] });
                  break;
                default:
                  break;
              }
            }}
          >
            {/* eslint-enable jsx-a11y/interactive-supports-focus */}
            <button
              type="button"
              className={cx({ 'is-active': activeTab === Tab.Stops })}
              onClick={() => {
                this.changeTab(Tab.Stops);
              }}
              tabIndex={activeTab === Tab.Stops ? 0 : -1}
              role="tab"
              ref={this.stopTabRef}
              aria-selected={activeTab === Tab.Stops}
              style={{
                '--totalCount': `${countOfButtons}`,
              }}
            >
              <div>
                <FormattedMessage id="stops" defaultMessage="Stops" />
              </div>
            </button>
            <button
              type="button"
              className={cx({ 'is-active': activeTab === Tab.Timetable })}
              onClick={() => {
                this.changeTab(Tab.Timetable);
              }}
              tabIndex={activeTab === Tab.Timetable ? 0 : -1}
              role="tab"
              ref={this.timetableTabRef}
              aria-selected={activeTab === Tab.Timetable}
              style={{
                '--totalCount': `${countOfButtons}`,
              }}
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
              onClick={() => {
                this.changeTab(Tab.Disruptions);
              }}
              tabIndex={activeTab === Tab.Disruptions ? 0 : -1}
              role="tab"
              ref={this.disruptionTabRef}
              aria-selected={activeTab === Tab.Disruptions}
              style={{
                '--totalCount': `${countOfButtons}`,
              }}
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
      </div>
    );
  }
}

export default RoutePageControlPanel;
