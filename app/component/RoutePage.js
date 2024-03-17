import PropTypes from 'prop-types';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage, intlShape } from 'react-intl';
import cx from 'classnames';
import { matchShape, routerShape, RedirectException } from 'found';
import { configShape, errorShape } from '../util/shapes';
import Icon from './Icon';

import Loading from './Loading';
import RouteAgencyInfo from './RouteAgencyInfo';
import RouteNumber from './RouteNumber';
import RoutePageControlPanel from './RoutePageControlPanel';
import { PREFIX_DISRUPTION, PREFIX_ROUTES } from '../util/path';
import withBreakpoint from '../util/withBreakpoint';
import BackButton from './BackButton';
import { isBrowser } from '../util/browser';
import LazilyLoad, { importLazy } from './LazilyLoad';
import { getRouteMode } from '../util/modeUtils';
import AlertBanner from './AlertBanner';
import {
  hasEntitiesOfType,
  hasMeaningfulData,
  isAlertValid,
} from '../util/alertUtils';
import { AlertEntityType } from '../constants';

const modules = {
  FavouriteRouteContainer: () =>
    importLazy(import('./FavouriteRouteContainer')),
};

// eslint-disable-next-line react/prefer-stateless-function
class RoutePage extends React.Component {
  static contextTypes = {
    getStore: PropTypes.func.isRequired,
    executeAction: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    config: configShape.isRequired,
  };

  static propTypes = {
    route: PropTypes.object.isRequired,
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    breakpoint: PropTypes.string.isRequired,
    error: errorShape,
    currentTime: PropTypes.number.isRequired,
  };

  static defaultProps = {
    error: undefined,
  };

  componentDidMount() {
    // Throw error in client side if relay fails to fetch data
    if (this.props.error && !this.props.route) {
      throw this.props.error.message;
    }
  }

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/anchor-is-valid */
  render() {
    const { breakpoint, router, route, error, currentTime } = this.props;
    const { config } = this.context;
    const tripId = this.props.match.params?.tripId;
    const patternId = this.props.match.params?.patternId;

    // Render something in client side to clear SSR
    if (isBrowser && error && !route) {
      return <Loading />;
    }

    if (route == null && !error) {
      /* In this case there is little we can do
       * There is no point continuing rendering as it can only
       * confuse user. Therefore redirect to Routes page */
      if (isBrowser) {
        router.replace(`/${PREFIX_ROUTES}`);
      } else {
        throw new RedirectException(`/${PREFIX_ROUTES}`);
      }
      return null;
    }
    const mode = getRouteMode(route);
    const label = route.shortName ? route.shortName : route.longName || '';
    const selectedPattern =
      patternId && route.patterns.find(p => p.code === patternId);
    const headsign = selectedPattern?.headsign;
    const filteredAlerts = selectedPattern?.alerts
      ?.filter(alert => hasEntitiesOfType(alert, AlertEntityType.Route))
      .filter(alert => isAlertValid(alert, currentTime));

    return (
      <div className={cx('route-page-container')}>
        <div className="header-for-printing">
          <h1>
            {config.title}
            {` - `}
            <FormattedMessage id="route-guide" defaultMessage="Route guide" />
          </h1>
        </div>
        <div
          className={cx('route-container', {
            'bp-large': breakpoint === 'large',
          })}
          aria-live="polite"
        >
          {breakpoint === 'large' && (
            <BackButton
              icon="icon-icon_arrow-collapse--left"
              iconClassName="arrow-icon"
            />
          )}
          <div className="route-header">
            <div aria-hidden="true">
              <RouteNumber
                color={route.color ? `#${route.color}` : null}
                mode={mode}
                text=""
              />
            </div>
            <div className="route-info">
              <h1
                className={cx('route-short-name', mode.toLowerCase())}
                style={{ color: route.color ? `#${route.color}` : null }}
              >
                <span className="sr-only" style={{ whiteSpace: 'pre' }}>
                  {this.context.intl.formatMessage({
                    id: mode.toLowerCase(),
                  })}{' '}
                  {label?.toLowerCase()}
                </span>
                <span aria-hidden="true">{label}</span>
              </h1>
              {tripId && headsign && (
                <div className="trip-destination">
                  <Icon className="in-text-arrow" img="icon-icon_arrow-right" />
                  <div className="destination-headsign">{headsign}</div>
                </div>
              )}
            </div>
            {!tripId && (
              <LazilyLoad modules={modules}>
                {({ FavouriteRouteContainer }) => (
                  <FavouriteRouteContainer
                    className="route-page-header"
                    gtfsId={route.gtfsId}
                  />
                )}
              </LazilyLoad>
            )}
          </div>
          {tripId && hasMeaningfulData(filteredAlerts) && (
            <div className="trip-page-alert-container">
              <AlertBanner
                alerts={filteredAlerts}
                linkAddress={`/${PREFIX_ROUTES}/${this.props.match.params.routeId}/${PREFIX_DISRUPTION}/${this.props.match.params.patternId}`}
              />
            </div>
          )}
          <RouteAgencyInfo route={route} />
        </div>
        {route &&
          route.patterns &&
          this.props.match.params.type === PREFIX_DISRUPTION && (
            <RoutePageControlPanel
              match={this.props.match}
              route={route}
              breakpoint={breakpoint}
            />
          )}
      </div>
    );
  }
}

const containerComponent = createFragmentContainer(
  connectToStores(withBreakpoint(RoutePage), ['TimeStore'], context => ({
    currentTime: context.getStore('TimeStore').getCurrentTime().unix(),
  })),
  {
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
        agency {
          name
          phone
        }
        patterns {
          alerts(types: [ROUTE, STOPS_ON_PATTERN]) {
            id
            alertDescriptionText
            alertHash
            alertHeaderText
            alertSeverityLevel
            alertUrl
            effectiveEndDate
            effectiveStartDate
            entities {
              __typename
              ... on Route {
                color
                type
                mode
                shortName
                gtfsId
              }
              ... on Stop {
                name
                code
                vehicleMode
                gtfsId
              }
            }
          }
          headsign
          code
          trips: tripsForDate(serviceDate: $date) {
            stoptimes: stoptimesForDate(serviceDate: $date) {
              realtimeState
              scheduledArrival
              scheduledDeparture
              serviceDay
            }
          }
          activeDates: trips {
            serviceId
            day: activeDates
          }
        }
      }
    `,
  },
);

export { containerComponent as default, RoutePage as Component };
