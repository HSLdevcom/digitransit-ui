import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import cx from 'classnames';
import { Link } from 'react-router';
import orderBy from 'lodash/orderBy';
import uniqBy from 'lodash/uniqBy';

import Departure from './Departure';
import { PREFIX_ROUTES } from '../util/path';
import DepartureListHeader from './DepartureListHeader';

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
          stoptime: 0,
          realtime: 0,
          headsign:
            routeProperties.stoptimes[0].headsign ||
            routeProperties.pattern.headsign,
        }),
      ),
    );
  } else {
    stopFromProps.routes.forEach(singleRoute =>
      singleRoute.patterns.forEach(singlePattern =>
        returnableRoutes.push({
          stop: { platformCode: stopFromProps.platformCode },
          pattern: {
            ...singlePattern,
            route: {
              ...singleRoute,
            },
          },
          stoptime: 0,
          realtime: 0,
          headsign: singlePattern.headsign,
        }),
      ),
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
  console.log(props);
  const mappedRoutes = mapRoutes(
    props.stop,
    props.params.terminalId ? 'terminal' : 'stop',
  );
  const timeTableRows = mappedRoutes.map(route => (
    <Link
      to={`/${PREFIX_ROUTES}/${route.pattern.route.gtfsId ||
        route.pattern.route.gtfsId}/pysakit/${route.pattern.code}`}
      key={`${route.pattern.code}-${route.headsign}-${route.pattern.route.id ||
        route.pattern.route.gtfsId}-${route.stop.platformCode}`}
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
      />
    </Link>
  ));

  return (
    <React.Fragment>
      <DepartureListHeader />
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
        }
        stoptimes {
          headsign
          pickupType
        }
      }
      routes {
        gtfsId
        shortName
        mode
        color
        patterns {
          headsign
          code
          name
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
