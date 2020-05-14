import PropTypes from 'prop-types';
import React from 'react';
import Toggle from './Toggle';
import Icon from './Icon';
import {
  mapDefaultNetworkProperties,
  getCityBikeNetworkName,
  getCityBikeNetworkConfig,
} from '../util/citybikes';

const CityBikeNetworkSelector = (
  { updateValue, currentOptions, isUsingCitybike },
  { config, getStore },
) => {
  const mappedCheckboxes = mapDefaultNetworkProperties(config).map(network => (
    <div
      className="mode-option-block citybike-network-container"
      key={`cb-${network.networkName}`}
      style={{ height: '2.5em' }}
    >
      <Icon
        className={`${network.icon}-icon`}
        img={`icon-icon_${network.icon}`}
        height={0.5}
        width={0.5}
      />
      <Toggle
        toggled={
          isUsingCitybike &&
          currentOptions.filter(
            option =>
              option.toUpperCase() === network.networkName.toUpperCase(),
          ).length > 0
        }
        label={getCityBikeNetworkName(
          getCityBikeNetworkConfig(network.networkName, config),
          getStore('PreferencesStore').getLanguage(),
        )}
        onToggle={() => {
          updateValue(network.networkName);
        }}
      />
    </div>
  ));

  return <React.Fragment>{mappedCheckboxes}</React.Fragment>;
};

CityBikeNetworkSelector.propTypes = {
  updateValue: PropTypes.func.isRequired,
  currentOptions: PropTypes.array.isRequired,
  isUsingCitybike: PropTypes.bool.isRequired,
};

CityBikeNetworkSelector.contextTypes = {
  config: PropTypes.object.isRequired,
  getStore: PropTypes.func.isRequired,
};

export default CityBikeNetworkSelector;
