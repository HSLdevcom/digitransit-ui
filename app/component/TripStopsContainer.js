import React from 'react';
import Relay from 'react-relay';
import some from 'lodash/some';
import cx from 'classnames';

import { getStartTime } from '../util/timeUtils';
import TripListHeader from './TripListHeader';
import TripStopListContainer from './TripStopListContainer';

function TripStopsContainer(props, { breakpoint }) {
  const tripStartTime = getStartTime(props.trip.stoptimesForDate[0].scheduledDeparture);

  const fullscreen = some(props.routes, route => route.fullscreenMap);

  return (
    <div
      className={cx('route-page-content', {
        'fullscreen-map': fullscreen && breakpoint !== 'large',
      })}
    >
      <TripListHeader key="header" className={breakpoint === 'large' && 'bp-large'} />
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
  pattern: React.PropTypes.object.isRequired,
  trip: React.PropTypes.shape({
    stoptimesForDate: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        scheduledDeparture: React.PropTypes.number.isRequired,
      }).isRequired,
    ).isRequired,
  }).isRequired,
  routes: React.PropTypes.arrayOf(React.PropTypes.shape({
    fullscreenMap: React.PropTypes.bool,
  })).isRequired,
  location: React.PropTypes.shape({
    pathname: React.PropTypes.string.isRequired,
  }).isRequired,
};

TripStopsContainer.contextTypes = {
  breakpoint: React.PropTypes.string,
};

export default Relay.createContainer(TripStopsContainer, {
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
