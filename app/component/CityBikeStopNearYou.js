import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import CityBikeAvailability from './CityBikeAvailability';
import Icon from './Icon';
import {
  getCityBikeNetworkIcon,
  getCityBikeNetworkConfig,
} from '../util/citybikes';

const CityBikeStopNearYou = ({ stop }, { config }) => {
  const totalSpaces = stop.bikesAvailable + stop.spacesAvailable;
  const fewAvailableCount = Math.floor(totalSpaces / 3);
  const fewerAvailableCount = Math.floor(totalSpaces / 6);
  const citybikeicon = getCityBikeNetworkIcon(
    getCityBikeNetworkConfig(stop.networks[0], config),
  );
  return (
    <span role="listitem">
      <div className="stop-near-you-container">
        <div className="stop-near-you-header-container">
          <div className="stop-header-content">
            <div className="stop-near-you-name">{stop.name}</div>
            <div className="bike-station-code">
              <FormattedMessage
                id="citybike-station"
                values={{
                  stationId: stop.stationId,
                }}
              />
            </div>
          </div>
        </div>
        <div className="citybike-content-container">
          <Icon img={citybikeicon} />
          <CityBikeAvailability
            bikesAvailable={stop.bikesAvailable}
            totalSpaces={totalSpaces}
            fewAvailableCount={fewAvailableCount}
            fewerAvailableCount={fewerAvailableCount}
            useSpacesAvailable
          />
        </div>
      </div>
    </span>
  );
};
CityBikeStopNearYou.contextTypes = {
  config: PropTypes.object.isRequired,
};
CityBikeStopNearYou.propTypes = {
  stop: PropTypes.object.isRequired,
};

export default CityBikeStopNearYou;
