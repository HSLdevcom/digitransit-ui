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
  BIKESTATION_OFF,
  BIKESTATION_CLOSED,
} from '../util/citybikes';

const CityBikeStopContent = ({ bikeRentalStation }, { config }) => {
  const citybikeCapacity = getCitybikeCapacity(
    config,
    bikeRentalStation.networks[0],
  );
  if (citybikeCapacity === BIKEAVL_UNKNOWN) {
    return null;
  }
  let totalSpaces;
  let fewAvailableCount;
  let fewerAvailableCount;

  if (citybikeCapacity === BIKEAVL_WITHMAX) {
    totalSpaces =
      bikeRentalStation.capacity ||
      bikeRentalStation.bikesAvailable + bikeRentalStation.spacesAvailable;
    fewAvailableCount = Math.floor(totalSpaces / 3);
    fewerAvailableCount = Math.floor(totalSpaces / 6);
  }
  const disabled =
    bikeRentalStation.state === BIKESTATION_OFF ||
    bikeRentalStation.state === BIKESTATION_CLOSED;

  const citybikeicon = getCityBikeNetworkIcon(
    getCityBikeNetworkConfig(bikeRentalStation.networks[0], config),
    disabled,
  );
  return (
    <div className="citybike-content-container">
      <Icon img={citybikeicon} />
      <CityBikeAvailability
        disabled={disabled}
        bikesAvailable={bikeRentalStation.bikesAvailable}
        totalSpaces={totalSpaces}
        fewAvailableCount={fewAvailableCount}
        fewerAvailableCount={fewerAvailableCount}
        useSpacesAvailable={citybikeCapacity === BIKEAVL_WITHMAX}
        networks={bikeRentalStation.networks}
      />
    </div>
  );
};

CityBikeStopContent.contextTypes = {
  config: PropTypes.object.isRequired,
};
CityBikeStopContent.propTypes = {
  bikeRentalStation: PropTypes.shape({
    bikesAvailable: PropTypes.number.isRequired,
    spacesAvailable: PropTypes.number.isRequired,
    capacity: PropTypes.number.isRequired,
    networks: PropTypes.arrayOf(PropTypes.string),
    state: PropTypes.string || BIKESTATION_CLOSED,
  }),
};
export default CityBikeStopContent;
