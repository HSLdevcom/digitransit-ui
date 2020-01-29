import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import some from 'lodash/some';
import cx from 'classnames';
import pure from 'recompose/pure';

import { getStartTime } from '../util/timeUtils';
import TripListHeader from './TripListHeader';
import TripStopListContainer from './TripStopListContainer';
import withBreakpoint from '../util/withBreakpoint';

function TripStopsContainer({ breakpoint, routes, trip }) {
  if (!trip) {
    return null;
  }

  const tripStartTime = getStartTime(
    trip.stoptimesForDate[0].scheduledDeparture,
  );

  const fullscreen = some(routes, route => route.fullscreenMap);

  if (fullscreen && breakpoint !== 'large') {
    return <div className="route-page-content" />;
  }

  return (
    <div
      className={cx('route-page-content', {
        'fullscreen-map': fullscreen && breakpoint !== 'large',
      })}
    >
      <TripListHeader key="header" className={`bp-${breakpoint}`} />
      <TripStopListContainer
        key="list"
        trip={trip}
        tripStart={tripStartTime}
        fullscreenMap={fullscreen}
      />
    </div>
  );
}

TripStopsContainer.propTypes = {
  trip: PropTypes.shape({
    stoptimesForDate: PropTypes.arrayOf(
      PropTypes.shape({
        scheduledDeparture: PropTypes.number.isRequired,
      }).isRequired,
    ).isRequired,
  }),
  routes: PropTypes.arrayOf(
    PropTypes.shape({
      fullscreenMap: PropTypes.bool,
    }),
  ).isRequired,
  breakpoint: PropTypes.string.isRequired,
};

TripStopsContainer.defaultProps = {
  trip: undefined,
};

const pureComponent = pure(withBreakpoint(TripStopsContainer));
const containerComponent = createFragmentContainer(pureComponent, {
  trip: graphql`
    fragment TripStopsContainer_trip on Trip {
      stoptimesForDate {
        scheduledDeparture
      }
      ...TripStopListContainer_trip
    }
  `,
  pattern: graphql`
    fragment TripStopsContainer_pattern on Pattern {
      id
    }
  `,
});

export { containerComponent as default, TripStopsContainer as Component };
