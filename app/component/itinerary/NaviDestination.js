import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from 'react-intl';
import Icon from '../Icon';
import StopCode from '../StopCode';
import { legShape } from '../../util/shapes';

function NaviDestination({ leg, focusToLeg }) {
  const { stop, rentalVehicle, vehicleParking, vehicleRentalStation } = leg.to;

  let toIcon;
  if (stop) {
    toIcon = `icon-icon_${stop.vehicleMode.toLowerCase()}-stop-lollipop`;
  } else if (rentalVehicle) {
    toIcon = 'icon-icon_scooter-lollipop';
  } else if (vehicleParking) {
    toIcon = 'icon-bike_parking';
  } else if (vehicleRentalStation) {
    toIcon = 'icon-icon_citybike';
  }

  const handleFocusToLeg = (l, isViaPoint) => () => {
    focusToLeg(l, isViaPoint);
  };

  return (
    <div className="navileg-destination-details">
      {toIcon && <Icon img={toIcon} className="navi-destination-icon" />}
      <div>
        {stop?.name}&nbsp;
        {stop?.code && <StopCode code={stop.code} />}
        {rentalVehicle?.rentalNetwork.networkId}
        {vehicleParking?.name}
        {vehicleRentalStation?.rentalNetwork.networkId}&nbsp;
        {vehicleRentalStation?.name}
      </div>
      <button
        type="button"
        onClick={handleFocusToLeg(leg, false)}
        className="navileg-focus"
      >
        <FormattedMessage
          id="navidest-show-on-map"
          defaultMessage="View route on map"
        />
      </button>
    </div>
  );
}

NaviDestination.propTypes = {
  leg: legShape.isRequired,
  focusToLeg: PropTypes.func.isRequired,
};

NaviDestination.contextTypes = {
  intl: intlShape.isRequired,
};

export default NaviDestination;
