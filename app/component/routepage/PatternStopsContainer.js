import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { matchShape } from 'found';
import { useIntl } from 'react-intl';
import cx from 'classnames';
import { routeShape } from '../../util/shapes';
import RouteStopListContainer from './RouteStopListContainer';
import withBreakpoint from '../../util/withBreakpoint';
import RouteControlPanel from './RouteControlPanel';
import { routePagePath } from '../../util/path';
import Error404 from '../404';
import ScrollableWrapper from '../ScrollableWrapper';
import { ExtendedRouteTypes } from '../../constants';
import { useConfigContext } from '../../configurations/ConfigContext';

function PatternStopsContainer({ pattern, match, breakpoint, route }) {
  const intl = useIntl();
  const config = useConfigContext();

  const routeId = route?.gtfsId;
  if (!pattern) {
    if (routeId) {
      match.router.replace(routePagePath(routeId));
    } else {
      return <Error404 />;
    }
    return null;
  }

  const { locale } = intl;
  const { constantOperationRoutes } = config;

  return (
    <ScrollableWrapper
      className={cx('route-page-content', {
        'bp-large': breakpoint === 'large',
      })}
    >
      {route && route.patterns && (
        <RouteControlPanel
          match={match}
          route={route}
          breakpoint={breakpoint}
        />
      )}
      {routeId && constantOperationRoutes[routeId] && (
        <div className="stop-constant-operation-container bottom-padding">
          <div style={{ width: '95%' }}>
            <span>{constantOperationRoutes[routeId][locale].text}</span>
            <span style={{ display: 'inline-block' }}>
              <a
                href={constantOperationRoutes[routeId][locale].link}
                target="_blank"
                rel="noreferrer"
              >
                {constantOperationRoutes[routeId][locale].link}
              </a>
            </span>
          </div>
        </div>
      )}
      {route.type !== ExtendedRouteTypes.CallAgency && (
        <RouteStopListContainer
          key="list"
          pattern={pattern}
          patternId={pattern.code}
          hideDepartures={!!constantOperationRoutes[routeId]}
        />
      )}
    </ScrollableWrapper>
  );
}

PatternStopsContainer.propTypes = {
  pattern: PropTypes.shape({
    code: PropTypes.string.isRequired,
  }),
  match: matchShape.isRequired,
  breakpoint: PropTypes.string.isRequired,
  route: routeShape.isRequired,
};

export default createFragmentContainer(withBreakpoint(PatternStopsContainer), {
  pattern: graphql`
    fragment PatternStopsContainer_pattern on Pattern
    @argumentDefinitions(
      currentTime: { type: "Long!", defaultValue: 0 }
      patternId: { type: "String!", defaultValue: "0" }
    ) {
      code
      ...RouteStopListContainer_pattern
        @arguments(currentTime: $currentTime, patternId: $patternId)
    }
  `,
  route: graphql`
    fragment PatternStopsContainer_route on Route
    @argumentDefinitions(date: { type: "String" }) {
      gtfsId
      color
      shortName
      longName
      mode
      type
      ...RouteAgencyInfo_route
      ...RoutePatternSelectContainer_route @arguments(date: $date)
      agency {
        phone
        name
      }
      patterns {
        alerts(types: [ROUTE, STOPS_ON_PATTERN]) {
          id
          alertSeverityLevel
          effectiveEndDate
          effectiveStartDate
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
});
