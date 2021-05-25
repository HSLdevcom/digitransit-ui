import PropTypes from 'prop-types';
import React, { useRef, useEffect } from 'react';
import Link from 'found/Link';
import { intlShape } from 'react-intl';
import VehicleIcon from './VehicleIcon';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../util/path';

function PatternLink(
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
  const ariaMessage = nextStopName
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

  const icon = (
    <Link
      to={`/${PREFIX_ROUTES}/${route}/${PREFIX_STOPS}/${pattern}`}
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

PatternLink.propTypes = {
  mode: PropTypes.string.isRequired,
  pattern: PropTypes.string.isRequired,
  route: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  vehicleNumber: PropTypes.string,
  color: PropTypes.string,
  setHumanScrolling: PropTypes.func,
  keepTracking: PropTypes.bool,
  stopName: PropTypes.string,
  nextStopName: PropTypes.string,
};

PatternLink.contextTypes = {
  intl: intlShape.isRequired,
};

export default PatternLink;
