import PropTypes from 'prop-types';
import React from 'react';
import { useFragment } from 'react-relay';
import cx from 'classnames';
import groupBy from 'lodash/groupBy';
import values from 'lodash/values';
import { useRealTimeInformation } from '../../hooks/RealTimeInformationContext';
import { getTripOrRouteMode } from '../../../utils/client/modeUtils';
import { getModeIconColor } from '../../../utils/shared/colorUtils';
import TripRouteStop from './TripRouteStop';
import { useBreakpoint } from '../../hooks/BreakpointContext';
import { useCurrentTime } from '../../hooks/TimeContext';
import TripStopListContainerFragment from './queries/TripStopListContainerFragment';
import { useConfigContext } from '../../hooks/ConfigContext';

function TripStopListContainer({
  trip: tripRef,
  className = undefined,
  tripStart,
  keepTracking = false,
  setHumanScrolling = () => {},
}) {
  const config = useConfigContext();
  const currentTime = useCurrentTime();
  const breakpoint = useBreakpoint();
  const { vehicles } = useRealTimeInformation();
  const trip = useFragment(TripStopListContainerFragment, tripRef);

  const mode = getTripOrRouteMode(trip, trip.route, config);

  const vehiclesByStop = groupBy(
    values(vehicles).filter(
      vehicle => currentTime - vehicle.timestamp < 5 * 60,
    ),
    vehicle => vehicle.next_stop,
  );

  const matchingVehicles = Object.keys(vehicles)
    .map(key => vehicles[key])
    .filter(
      vehicle =>
        vehicle.direction === undefined ||
        trip.pattern.directionId === undefined ||
        trip.pattern.directionId === -1 ||
        vehicle.direction === trip.pattern.directionId,
    )
    .filter(
      vehicle =>
        vehicle.tripStartTime === undefined ||
        vehicle.tripStartTime === tripStart,
    )
    .filter(
      vehicle => vehicle.tripId === undefined || vehicle.tripId === trip.gtfsId,
    );

  // selected vehicle
  const vehicle = matchingVehicles.length > 0 ? matchingVehicles[0] : undefined;
  const nextStop = vehicle?.next_stop;
  let stopPassed = true;

  const nextStopExistsOnRoute =
    nextStop &&
    trip.stoptimesForDate.some(stoptime => stoptime.stop.gtfsId === nextStop);

  return (
    <>
      <div
        id="route-stop-panel"
        className={cx('route-stop-list', className)}
        role="tabpanel"
        aria-labelledby="route-stop-tab"
      >
        {trip.stoptimesForDate.map((stoptime, index) => {
          if (nextStop === stoptime.stop.gtfsId) {
            stopPassed = false;
          } else if (
            stoptime.realtimeDeparture + stoptime.serviceDay > currentTime &&
            (!vehicle || !vehicle.next_stop || !nextStopExistsOnRoute)
          ) {
            stopPassed = false;
          }
          const nextStoptimeForDate = trip.stoptimesForDate[index + 1];
          const prevStop = trip.stoptimesForDate[index - 1]?.stop;

          return (
            <TripRouteStop
              key={stoptime.stop.gtfsId}
              stoptime={stoptime}
              stop={stoptime.stop}
              nextStop={nextStoptimeForDate ? nextStoptimeForDate.stop : null}
              prevStop={prevStop || null}
              mode={mode}
              color={
                trip.route && trip.route.color
                  ? `#${trip.route.color}`
                  : getModeIconColor(config, mode)
              }
              vehicles={vehiclesByStop[stoptime.stop.gtfsId]}
              selectedVehicle={vehicle}
              stopPassed={stopPassed}
              realtime={stoptime.realtime}
              currentTime={currentTime}
              realtimeDeparture={stoptime.realtimeDeparture}
              pattern={trip.pattern.code}
              route={trip.route.gtfsId}
              last={index === trip.stoptimesForDate.length - 1}
              first={index === 0}
              className={`bp-${breakpoint}`}
              shortName={trip.route && trip.route.shortName}
              keepTracking={keepTracking}
              setHumanScrolling={setHumanScrolling}
            />
          );
        })}
      </div>
      <div className="bottom-whitespace" />
    </>
  );
}

TripStopListContainer.propTypes = {
  trip: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  className: PropTypes.string,
  tripStart: PropTypes.string.isRequired,
  keepTracking: PropTypes.bool,
  setHumanScrolling: PropTypes.func,
};

export default TripStopListContainer;
