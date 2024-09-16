import React from 'react';
import { intlShape } from 'react-intl';
import { legShape } from '../../util/shapes';

function NaviDestination({ leg }) {
  const { stop, rentalVehicle, vehicleParking, vehicleRentalStation, name } =
    leg.to;
  const plat = `Laituri: ${stop?.platformCode}`;
  return (
    <div className="navileg-destination-details">
      <div>
        {stop?.name || name} &nbsp;
        {stop?.code} &nbsp;
        {stop?.platformCode && plat}
        {rentalVehicle?.rentalNetwork.networkId}
        {vehicleParking?.name}
        {vehicleRentalStation?.rentalNetwork.networkId}&nbsp;
        {vehicleRentalStation?.name}
      </div>
    </div>
  );
}

NaviDestination.propTypes = {
  leg: legShape.isRequired,
};

NaviDestination.contextTypes = {
  intl: intlShape.isRequired,
};

export default NaviDestination;
