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
const containerComponent = Relay.createContainer(pureComponent, {
  fragments: {
    trip: () => Relay.QL`
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

export { containerComponent as default, TripStopsContainer as Component };
