import PropTypes from 'prop-types';
import React from 'react';
import CityBikeAvailability from './CityBikeAvailability';
import Icon from './Icon';
import {
  getCityBikeNetworkIcon,
  getCityBikeNetworkConfig,
} from '../util/citybikes';

const CityBikeStopContent = ({ bikeRentalStation }, { config }) => {
  const totalSpaces =
    bikeRentalStation.bikesAvailable + bikeRentalStation.spacesAvailable;
  const fewAvailableCount = Math.floor(totalSpaces / 3);
  const fewerAvailableCount = Math.floor(totalSpaces / 6);
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
        useSpacesAvailable
      />
    </div>
  );
};

CityBikeStopContent.contextTypes = {
  config: PropTypes.object.isRequired,
};
export default CityBikeStopContent;
