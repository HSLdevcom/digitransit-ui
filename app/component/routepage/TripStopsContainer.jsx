import React, { useState, useRef, memo } from 'react';
import { useFragment } from 'react-relay';
import cx from 'classnames';
import debounce from 'lodash/debounce';
import { fragmentRefShape } from '../../../utils/client/shapes';
import RouteControlPanel from './RouteControlPanel';
import { getStartTime } from '../../../utils/client/timeUtils';
import TripStopListContainer from './TripStopListContainer';
import { useBreakpoint } from '../../hooks/BreakpointContext';
import ScrollableWrapper from '../ScrollableWrapper';
import TripStopsContainerFragment from './queries/TripStopsContainerFragment';

const TripStopsContainer = memo(function TripStopsContainer({
  trip: tripRef,
  route: routeRef,
}) {
  const breakpoint = useBreakpoint();
  const trip = useFragment(TripStopsContainerFragment.trip, tripRef);
  const route = useFragment(TripStopsContainerFragment.route, routeRef);
  const [keepTracking, setTracking] = useState(true);
  const humanScrolling = useRef(true);

  const setHumanScrolling = boolVal => {
    humanScrolling.current = boolVal;
  };

  if (!trip) {
    return null;
  }

  const tripStartTime = getStartTime(
    trip.stoptimesForDate[0].scheduledDeparture,
  );

  const handleScroll = () => {
    if (humanScrolling.current && keepTracking) {
      setTracking(false);
    }
  };

  return (
    <ScrollableWrapper
      className={cx('route-page-content', {
        'bp-large': breakpoint === 'large',
      })}
      id="trip-route-page-content"
      onScroll={debounce(handleScroll, 100, { leading: true })}
    >
      {route && route.patterns && (
        <RouteControlPanel
          route={route}
          breakpoint={breakpoint}
          tripStartTime={tripStartTime}
        />
      )}
      <TripStopListContainer
        key="list"
        trip={trip}
        tripStart={tripStartTime}
        keepTracking={keepTracking}
        setHumanScrolling={setHumanScrolling}
      />
    </ScrollableWrapper>
  );
});

TripStopsContainer.propTypes = {
  trip: fragmentRefShape,
  route: fragmentRefShape,
};

export default TripStopsContainer;
export { TripStopsContainer as Component };
