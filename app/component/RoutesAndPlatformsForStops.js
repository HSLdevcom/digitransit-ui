import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import { Link } from 'react-router';
import orderBy from 'lodash/orderBy';
import uniqBy from 'lodash/uniqBy';

import Departure from './Departure';
import DepartureListHeader from './DepartureListHeader';
import Icon from './Icon';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../util/path';
import { routeNameCompare } from '../util/searchUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';

export const mapRoutes = (stopFromProps, stopType) => {
  const stopRoutes = [];
  const returnableRoutes = [];
  if (stopType === 'terminal') {
    stopFromProps.stops.forEach(stopTime => stopRoutes.push({ ...stopTime }));
    stopRoutes.forEach(route =>
      route.stoptimesForPatterns.forEach(routeProperties =>
        returnableRoutes.push({
          stop: { platformCode: route.platformCode },
          pattern: {
            ...routeProperties.pattern,
            route: {
              ...routeProperties.pattern.route,
            },
          },
          pickupType: routeProperties.stoptimes[0].pickupType,
          stoptime: 0,
          realtime: false,
          lastStop:
            stopFromProps.stops.filter(
              singleStop =>
                singleStop.gtfsId ===
                routeProperties.pattern.stops[
                  routeProperties.pattern.stops.length - 1
                ].gtfsId,
            ).length > 0,
          headsign:
            routeProperties.stoptimes[0].headsign ||
            routeProperties.pattern.headsign,
        }),
      ),
    );
  } else {
    stopFromProps.stoptimesForPatterns.forEach(singlePattern =>
      returnableRoutes.push({
        stop: { platformCode: stopFromProps.platformCode },
        ...singlePattern,
        pickupType: singlePattern.stoptimes[0].pickupType,
        stoptime: 0,
        realtime: false,
        lastStop:
          stopFromProps.gtfsId ===
          singlePattern.pattern.stops[singlePattern.pattern.stops.length - 1]
            .gtfsId,
        headsign: singlePattern.pattern.headsign,
      }),
    );
  }

  const orderedRoutes = orderBy(
    returnableRoutes,
    'pattern.route.shortName',
    'asc',
  );

  return uniqBy(orderedRoutes, v =>
    [v.pattern.headsign, v.pattern.route.shortName, v.stop.platformCode].join(),
  );
};

const RoutesAndPlatformsForStops = props => {
  const mappedRoutes = mapRoutes(
    props.stop,
    props.params.terminalId ? 'terminal' : 'stop',
  ).sort((x, y) => routeNameCompare(x.pattern.route, y.pattern.route));

  if (mappedRoutes.length === 0) {
    return (
      <div className="stop-no-departures-container">
        <Icon img="icon-icon_station" />
        <FormattedMessage id="no-departures" defaultMessage="No departures" />
      </div>
    );
  }

  // DT-3331: added query string sort=no to Link's to
  const timeTableRows = mappedRoutes.map(route => (
    <Link
      to={`/${PREFIX_ROUTES}/${route.pattern.route.gtfsId ||
        route.pattern.route.gtfsId}/${PREFIX_STOPS}/${
        route.pattern.code
      }?sort=no`}
      key={`${route.pattern.code}-${route.headsign}-${route.pattern.route.id ||
        route.pattern.route.gtfsId}-${route.stop.platformCode}`}
      onClick={() => {
        addAnalyticsEvent({
          category: 'Stop',
          name: 'RoutesAndPlatformsTab',
          action: 'OpenRouteViewFromStop',
        });
      }}
    >
      <Departure
        key={`${route.pattern.code}-${route.headsign}-${route.pattern.route
          .id || route.pattern.route.gtfsId}-${route.stop.platformCode}`}
        departure={route}
        showStop
        currentTime={0}
        className={cx('departure padding-normal border-bottom')}
        showPlatformCode
        staticDeparture
        isArrival={route.pickupType === 'NONE'}
        isLastStop={route.lastStop}
      />
    </Link>
  ));

  return (
    <React.Fragment>
      <DepartureListHeader staticDeparture />
      <div className={cx('departure-list stop-page momentum-scroll')}>
        {timeTableRows}
      </div>
    </React.Fragment>
  );
};

RoutesAndPlatformsForStops.propTypes = {
  stop: PropTypes.object.isRequired,
  params: PropTypes.oneOfType([
    PropTypes.shape({ stopId: PropTypes.string.isRequired }).isRequired,
    PropTypes.shape({ terminalId: PropTypes.string.isRequired }).isRequired,
  ]).isRequired,
};

const withRelayContainer = Relay.createContainer(RoutesAndPlatformsForStops, {
  fragments: {
    stop: () => Relay.QL`
    fragment RoutesAndPlatformsForStops on Stop {
      gtfsId
      name
      platformCode
      stoptimesForPatterns(numberOfDepartures: 1, timeRange: 604800) {
        pattern {
          headsign
          code
          route {
            id
            gtfsId
            shortName
            longName
            mode
            color
          }
          stops {
            gtfsId
          }
        }
        stoptimes {
          headsign
          pickupType
        }
      }
      stops {
        gtfsId
        platformCode
        stoptimesForPatterns(numberOfDepartures: 1, timeRange: 604800) {
          pattern {
            headsign
            code
            route {
              id
              gtfsId
              shortName
              longName
              mode
              color
            }
            stops {
              gtfsId
            }
          }
          stoptimes {
            headsign
            pickupType
          }
        }
      }
      }
      `,
  },
});

export {
  withRelayContainer as default,
  RoutesAndPlatformsForStops as Component,
};
