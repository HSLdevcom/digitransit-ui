import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import cx from 'classnames';
import VehicleIcon from './VehicleIcon';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../util/path';

function PatternLink({
  mode,
  pattern,
  route,
  vehicleNumber,
  selected = false,
}) {
  // DT-3331: added query string sort=no to Link's to
  return (
    <Link
      to={`/${PREFIX_ROUTES}/${route}/${PREFIX_STOPS}/${pattern}?sort=no`}
      className="route-now-content"
    >
      <VehicleIcon
        mode={mode}
        rotate={180}
        vehicleNumber={vehicleNumber}
        className={cx({ 'selected-tail-icon': selected })}
        useLargeIcon
      />
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
