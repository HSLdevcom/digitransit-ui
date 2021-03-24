import PropTypes from 'prop-types';
import React from 'react';
import CityBikeAvailability from './CityBikeAvailability';
import Icon from './Icon';
import {
  getCityBikeNetworkIcon,
  getCityBikeNetworkConfig,
  BIKEAVL_UNKNOWN,
  BIKEAVL_WITHMAX,
} from '../util/citybikes';

const CityBikeStopContent = ({ bikeRentalStation, setFull }, { config }) => {
  if (config.cityBike.capacity === BIKEAVL_UNKNOWN) {
    return null;
  }
  let totalSpaces;
  let fewAvailableCount;
  let fewerAvailableCount;

  if (config.cityBike.capacity === BIKEAVL_WITHMAX) {
    totalSpaces =
      bikeRentalStation.bikesAvailable + bikeRentalStation.spacesAvailable;
    fewAvailableCount = Math.floor(totalSpaces / 3);
    fewerAvailableCount = Math.floor(totalSpaces / 6);
  }
  const citybikeicon = getCityBikeNetworkIcon(
    getCityBikeNetworkConfig(bikeRentalStation.networks[0], config),
  );

  return (
    <div className="citybike-content-container">
      <Icon img={citybikeicon} />
      <CityBikeAvailability
        bikesAvailable={bikeRentalStation.bikesAvailable}
        totalSpaces={totalSpaces}
        fewAvailableCount={fewAvailableCount}
        fewerAvailableCount={fewerAvailableCount}
        useSpacesAvailable={config.cityBike.capacity === BIKEAVL_WITHMAX}
        setFull={setFull}
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
    networks: PropTypes.arrayOf(PropTypes.string),
  }),
  setFull: PropTypes.func.isRequired,
};
export default CityBikeStopContent;
