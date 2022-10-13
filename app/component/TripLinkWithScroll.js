import PropTypes from 'prop-types';
import React, { useRef, useEffect } from 'react';
import Link from 'found/Link';
import { intlShape } from 'react-intl';
import VehicleIcon from './VehicleIcon';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../util/path';

function TripLinkWithScroll(
  {
    mode,
    pattern,
    route,
    vehicleNumber,
    selected = false,
    setHumanScrolling,
    color,
    keepTracking,
    stopName,
    nextStopName,
    tripId,
    vehicleState,
  },
  context,
) {
  const trackedVehicleRef = useRef();
  const shouldUpdate = useRef(true);
  useEffect(() => {
    if (selected && keepTracking && shouldUpdate.current) {
      setHumanScrolling(false);
      shouldUpdate.current = false;

      const elemRect = document
        .getElementById('tracked-vehicle-marker')
        .getBoundingClientRect();
      const containerRect = document
        .getElementById('trip-route-page-content')
        .getBoundingClientRect();
      const markerPadding = 30;
      const topPos = Math.abs(elemRect.top - containerRect.top - markerPadding);
      const elemToScroll = document.getElementById('trip-route-page-content');

      if (topPos && topPos !== elemToScroll.scrollTop) {
        elemToScroll.scrollTop += topPos;
      }

      setTimeout(() => {
        setHumanScrolling(true);
      }, 250);
      setTimeout(() => {
        shouldUpdate.current = true;
      }, 4000);
    }
  });
  const localizedMode = context.intl.formatMessage({
    id: `${mode}`,
    defaultMessage: `${mode}`,
  });
  let ariaMessage = !(vehicleState === 'arrived')
    ? context.intl.formatMessage(
        {
          id: 'route-page-vehicle-position-between',
          defaultMessage:
            '{mode} {shortName} is between {stopName} and {nextStopName}',
        },
        {
          stopName,
          nextStopName,
          mode: localizedMode,
          shortName: vehicleNumber,
        },
      )
    : context.intl.formatMessage(
        {
          id: 'route-page-vehicle-position',
          defaultMessage: '{mode} {shortName} is at {stopName}',
        },
        { stopName, mode: localizedMode, shortName: vehicleNumber },
      );
  if (selected) {
    ariaMessage += context.intl.formatMessage({
      id: 'route-page-vehicle-selected',
      defaultMessage: 'Current selection.',
    });
  }
  const icon = (
    <Link
      to={`/${PREFIX_ROUTES}/${route}/${PREFIX_STOPS}/${pattern}/${tripId}`}
      className="route-now-content"
      aria-label={ariaMessage}
    >
      <VehicleIcon
        mode={mode}
        rotate={180}
        vehicleNumber={vehicleNumber}
        useLargeIcon
        color={color}
      />
    </Link>
  );

  return selected ? (
    <div ref={trackedVehicleRef} id="tracked-vehicle-marker">
      {icon}
    </div>
  ) : (
    icon
  );
}

TripLinkWithScroll.propTypes = {
  mode: PropTypes.string.isRequired,
  pattern: PropTypes.string.isRequired,
  route: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  vehicleNumber: PropTypes.string,
  color: PropTypes.string,
  setHumanScrolling: PropTypes.func.isRequired,
  keepTracking: PropTypes.bool,
  stopName: PropTypes.string,
  nextStopName: PropTypes.string,
  tripId: PropTypes.string,
  vehicleState: PropTypes.string,
};

TripLinkWithScroll.defaultProps = {
  vehicleState: '',
  tripId: '',
  keepTracking: false,
  color: '',
  selected: false,
  vehicleNumber: '',
  nextStopName: '',
  stopName: '',
};

TripLinkWithScroll.contextTypes = {
  intl: intlShape.isRequired,
};

export default TripLinkWithScroll;
