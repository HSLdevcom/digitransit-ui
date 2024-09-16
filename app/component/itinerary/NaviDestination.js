import React from 'react';
import { intlShape } from 'react-intl';
import StopCode from '../StopCode';
import PlatformNumber from '../PlatformNumber';
import { legShape } from '../../util/shapes';

function NaviDestination({ leg }) {
  const { stop, rentalVehicle, vehicleParking, vehicleRentalStation, name } =
    leg.to;

  return (
    <div className="navileg-destination-details">
      <div>
        {stop?.name || name}
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
