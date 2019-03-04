import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage, intlShape } from 'react-intl';
import cx from 'classnames';
import { routerShape } from 'react-router';

import Icon from './Icon';
import CallAgencyWarning from './CallAgencyWarning';
import FavouriteRouteContainer from './FavouriteRouteContainer';
import RoutePatternSelect from './RoutePatternSelect';
import RouteAgencyInfo from './RouteAgencyInfo';
import RouteNumber from './RouteNumber';
import { DATE_FORMAT } from '../constants';
import {
  startRealTimeClient,
  stopRealTimeClient,
} from '../action/realTimeClientAction';
import {
  routeHasServiceAlert,
  routeHasCancelation,
  stopHasServiceAlert,
} from '../util/alertUtils';
import { PREFIX_ROUTES } from '../util/path';
import withBreakpoint from '../util/withBreakpoint';

const Tab = {
  Disruptions: 'hairiot',
  Stops: 'pysakit',
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

  componentDidMount() {
    const { realTime } = this.context.config;
    if (!realTime || this.props.route == null) {
      return;
    }
    const route = this.props.route.gtfsId.split(':');
    const agency = route[0];
    const source = realTime[agency];
    if (source) {
      const id = source.routeSelector(this.props);

      this.context.executeAction(startRealTimeClient, {
        ...source,
        agency,
        options: [
          {
            route: id,
            // add some information from the context
            // to compensate potentially missing feed data
            mode: this.props.route.mode.toLowerCase(),
            gtfsId: route[1],
          },
        ],
      });
    }
  }

  componentWillUnmount() {
    const { client } = this.context.getStore('RealTimeInformationStore');

    if (client) {
      this.context.executeAction(stopRealTimeClient, client);
    }
  }

  onPatternChange = e => {
    this.context.router.replace(
      decodeURIComponent(this.props.location.pathname).replace(
        new RegExp(`${this.props.params.patternId}(.*)`),
        e.target.value,
      ),
    );
  };

  changeTab = tab => {
    const path = `/${PREFIX_ROUTES}/${this.props.route.gtfsId}/${tab}/${this
      .props.params.patternId || ''}`;
    this.context.router.replace(path);
  };

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/anchor-is-valid */
  render() {
    const { route } = this.props;
    if (route == null) {
      /* In this case there is little we can do
       * There is no point continuing rendering as it can only
       * confuse user. Therefore redirect to Routes page */
      this.context.router.replace(`/${PREFIX_ROUTES}`);
      return null;
    }

    const activeTab = getActiveTab(this.props.location.pathname);
    const { patternId } = this.props.params;
    const hasActiveAlert =
      routeHasServiceAlert(route, patternId) ||
      routeHasCancelation(route, patternId) ||
      (Array.isArray(route.patterns) &&
        route.patterns
          .filter(pattern => pattern.code === patternId)
          .some(
            pattern =>
              Array.isArray(pattern.stops) &&
              pattern.stops.some(stopHasServiceAlert),
          ));

    return (
      <div>
        <div className="header-for-printing">
          <h1>
            <FormattedMessage
              id="print-route-app-title"
              defaultMessage={this.context.config.title}
            />
            {` - `}
            <FormattedMessage id="route-guide" defaultMessage="Route guide" />
          </h1>
        </div>
        {route.type === 715 && <CallAgencyWarning route={route} />}
        <div className="tabs route-tabs">
          <nav
            className={cx('tabs-navigation', {
              'bp-large': this.props.breakpoint === 'large',
            })}
          >
            {this.props.breakpoint === 'large' && (
              <RouteNumber
                color={route.color ? `#${route.color}` : null}
                mode={route.mode}
                text={route.shortName}
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
              <div>
                <Icon img="icon-icon_caution" />
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
              params={this.props.params}
              route={route}
              onSelectChange={this.onPatternChange}
              gtfsId={route.gtfsId}
              activeTab={activeTab}
              className={cx({
                'bp-large': this.props.breakpoint === 'large',
              })}
            />
          )}
          <RouteAgencyInfo route={route} />
        </div>
      </div>
    );
  }
}

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
        alerts {
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
          code
          stops {
            alerts {
              alertSeverityLevel
            }
          }
          trips: tripsForDate(serviceDay: $serviceDay) {
            stoptimes: stoptimesForDate(serviceDay: $serviceDay) {
              realtimeState
            }
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
