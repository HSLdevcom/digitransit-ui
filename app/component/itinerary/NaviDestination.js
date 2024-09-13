import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from 'react-intl';
import Icon from '../Icon';
import StopCode from '../StopCode';
import PlatformNumber from '../PlatformNumber';
import { legShape } from '../../util/shapes';

function NaviDestination({ leg, focusToLeg }) {
  const { stop, rentalVehicle, vehicleParking, vehicleRentalStation, name } =
    leg.to;
  let placeName;
  let toIcon;
  if (stop) {
    toIcon = `icon-icon_${stop.vehicleMode.toLowerCase()}-stop-lollipop`;
  } else if (rentalVehicle) {
    toIcon = 'icon-icon_scooter-lollipop';
  } else if (vehicleParking) {
    toIcon = 'icon-bike_parking';
  } else if (vehicleRentalStation) {
    toIcon = 'icon-icon_citybike';
  } else {
    toIcon = 'icon-icon_place';
    placeName = name;
  }

  const handleFocusToLeg = (l, maximize) => () => {
    focusToLeg(l, maximize);
  };

  return (
    <div className="navileg-destination-details">
      {toIcon && <Icon img={toIcon} className="navi-destination-icon" />}
      <div>
        {stop?.name || placeName}
        {stop?.code && <StopCode code={stop.code} />}
        {stop?.platformCode && (
          <PlatformNumber
            number={stop.platformCode}
            short={false}
            isRailOrSubway={
              stop.vehicleMode === 'RAIL' || stop.vehicleMode === 'SUBWAY'
            }
          />
        )}
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
