import PropTypes from 'prop-types';
import React, { useRef, useEffect } from 'react';
import Link from 'found/Link';
import IconWithTail from './IconWithTail';
import SelectedIconWithTail from './SelectedIconWithTail';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../util/path';

function PatternLink({
  mode,
  pattern,
  route,
  vehicleNumber,
  selected = false,
}) {
  const trackedVehicleRef = useRef();

  useEffect(() => {
    if (selected) {
      trackedVehicleRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'center',
      });
    }
  }, []);

  const imgName = `icon-icon_${mode}-live`;
  const icon = (selected && (
    <div ref={trackedVehicleRef}>
      <SelectedIconWithTail
        img={imgName}
        mode={mode}
        vehicleNumber={vehicleNumber}
      />
    </div>
  )) || (
    <IconWithTail
      desaturate
      mode={mode}
      rotate={180}
      vehicleNumber={vehicleNumber}
    />
  );

  // DT-3331: added query string sort=no to Link's to
  return (
    <Link
      to={`/${PREFIX_ROUTES}/${route}/${PREFIX_STOPS}/${pattern}?sort=no`}
      className="route-now-content"
    >
      {icon}
    </Link>
  );
}

PatternLink.propTypes = {
  mode: PropTypes.string.isRequired,
  pattern: PropTypes.string.isRequired,
  route: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  vehicleNumber: PropTypes.string,
};

export default PatternLink;
