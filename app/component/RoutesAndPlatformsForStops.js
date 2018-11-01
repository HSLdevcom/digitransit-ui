import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import cx from 'classnames';
import { Link } from 'react-router';
import orderBy from 'lodash/orderBy';

import Departure from './Departure';
import { PREFIX_ROUTES } from '../util/path';

const RoutesAndPlatformsForStops = props => {
  const stopRoutes = [];
  const mappedRoutes = [];

  if (props.stopType === 'terminal') {
    props.stop.stops.forEach(stopTime => stopRoutes.push({ ...stopTime }));
    stopRoutes.forEach(route =>
      route.stoptimesForPatterns.forEach(routeProperties =>
        mappedRoutes.push({
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
    props.stop.routes.forEach(singleRoute =>
      singleRoute.patterns.forEach(singlePattern =>
        mappedRoutes.push({
          stop: { platformCode: props.stop.platformCode },
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

  const sortedRoutes = orderBy(mappedRoutes, 'pattern.route.shortName', 'asc');

  const timeTableRows = sortedRoutes.map(route => (
    <Link
      to={`/${PREFIX_ROUTES}/${route.pattern.code}`}
      key={`${route.pattern.code}-${route.headsign}-${route.pattern.route.id}`}
    >
      <Departure
        key={`${route.pattern.code}-${route.headsign}-${
          route.pattern.route.id
        }`}
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
    <div className={cx('departure-list stop-page momentum-scroll')}>
      {timeTableRows}
    </div>
  );
};

RoutesAndPlatformsForStops.propTypes = {
  stop: PropTypes.object.isRequired,
  stopType: PropTypes.string,
};

export default Relay.createContainer(RoutesAndPlatformsForStops, {
  fragments: {
    stop: () => Relay.QL`
    fragment RoutesAndPlatformsForStops on Stop {
      gtfsId
      name
      platformCode
      routes {
        gtfsId
        shortName
        mode
        color
        patterns {
          headsign
          code
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
          }
        }
      }
      }
      `,
  },
});
