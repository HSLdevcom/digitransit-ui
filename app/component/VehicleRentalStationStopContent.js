import PropTypes from 'prop-types';
import React from 'react';
import CityBikeAvailability from './CityBikeAvailability';
import Icon from './Icon';
import {
  getCityBikeNetworkIcon,
  getCityBikeNetworkConfig,
  getCitybikeCapacity,
  BIKEAVL_UNKNOWN,
  BIKEAVL_WITHMAX,
} from '../util/citybikes';

const VehicleRentalStationStopContent = (
  { vehicleRentalStation },
  { config },
) => {
  const citybikeCapacity = getCitybikeCapacity(
    config,
    vehicleRentalStation.network,
  );
  if (citybikeCapacity === BIKEAVL_UNKNOWN) {
    return null;
  }
  let totalSpaces;
  let fewAvailableCount;
  let fewerAvailableCount;

  if (citybikeCapacity === BIKEAVL_WITHMAX) {
    totalSpaces =
      vehicleRentalStation.capacity ||
      vehicleRentalStation.vehiclesAvailable +
        vehicleRentalStation.spacesAvailable;
    fewAvailableCount = Math.floor(totalSpaces / 3);
    fewerAvailableCount = Math.floor(totalSpaces / 6);
  }
  const disabled = !vehicleRentalStation.operative;

  const citybikeicon = getCityBikeNetworkIcon(
    getCityBikeNetworkConfig(vehicleRentalStation.network, config),
    disabled,
  );
  return (
    <div className="citybike-content-container">
      <Icon img={citybikeicon} />
      <CityBikeAvailability
        disabled={disabled}
        bikesAvailable={vehicleRentalStation.vehiclesAvailable}
        totalSpaces={totalSpaces}
        fewAvailableCount={fewAvailableCount}
        fewerAvailableCount={fewerAvailableCount}
        useSpacesAvailable={citybikeCapacity === BIKEAVL_WITHMAX}
      />
    </div>
  );
};

VehicleRentalStationStopContent.contextTypes = {
  config: PropTypes.object.isRequired,
};
VehicleRentalStationStopContent.propTypes = {
  vehicleRentalStation: PropTypes.shape({
    vehiclesAvailable: PropTypes.number.isRequired,
    spacesAvailable: PropTypes.number.isRequired,
    capacity: PropTypes.number.isRequired,
    network: PropTypes.string,
    operative: PropTypes.bool.isRequired,
  }),
};
export default VehicleRentalStationStopContent;
