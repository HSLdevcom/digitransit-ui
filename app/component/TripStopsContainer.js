import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import cx from 'classnames';
import pure from 'recompose/pure';
import { matchShape } from 'found';

import { getStartTime } from '../util/timeUtils';
import TripStopListContainer from './TripStopListContainer';
import withBreakpoint from '../util/withBreakpoint';

function TripStopsContainer({ breakpoint, match, trip }) {
  if (!trip) {
    return null;
  }

  const tripStartTime = getStartTime(
    trip.stoptimesForDate[0].scheduledDeparture,
  );

  const fullscreen =
    match.location.state && match.location.state.fullscreenMap === true;

  if (fullscreen && breakpoint !== 'large') {
    return <div className="route-page-content" />;
  }

  return (
    <div
      className={cx('route-page-content', {
        'fullscreen-map': fullscreen && breakpoint !== 'large',
      })}
    >
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
  match: matchShape.isRequired,
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
