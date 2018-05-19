import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import some from 'lodash/some';
import cx from 'classnames';
import pure from 'recompose/pure';

import { getStartTime } from '../util/timeUtils';
import TripListHeader from './TripListHeader';
import TripStopListContainer from './TripStopListContainer';
import withBreakpoint from '../util/withBreakpoint';

function TripStopsContainer({ breakpoint, ...props }) {
  const tripStartTime = getStartTime(
    props.trip.stoptimesForDate[0].scheduledDeparture,
  );

  const fullscreen = some(props.routes, route => route.fullscreenMap);

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
        trip={props.trip}
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
  }).isRequired,
  routes: PropTypes.arrayOf(
    PropTypes.shape({
      fullscreenMap: PropTypes.bool,
    }),
  ).isRequired,
  breakpoint: PropTypes.string.isRequired,
};

export default Relay.createContainer(pure(withBreakpoint(TripStopsContainer)), {
  fragments: {
    trip: () =>
      Relay.QL`
      fragment on Trip {
        stoptimesForDate {
          scheduledDeparture
        }
        ${TripStopListContainer.getFragment('trip')}
      }
    `,
    pattern: () => Relay.QL`
      fragment on Pattern {
        id
      }
    `,
  },
});
