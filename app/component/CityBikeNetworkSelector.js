import PropTypes from 'prop-types';
import React from 'react';
import Checkbox from './Checkbox';
import {
  mapDefaultNetworkProperties,
  getCityBikeNetworkName,
  getCityBikeNetworkConfig,
} from '../util/citybikes';

const CityBikeNetworkSelector = (
  { updateValue, headerText, currentOptions, isUsingCitybike },
  { config, getStore },
) => {
  const mappedCheckboxes = mapDefaultNetworkProperties(config).map(network => (
    <Checkbox
      checked={
        isUsingCitybike &&
        currentOptions.filter(
          option => option.toUpperCase() === network.networkName.toUpperCase(),
        ).length > 0
      }
      defaultMessage={getCityBikeNetworkName(
        getCityBikeNetworkConfig(network.networkName, config),
        getStore('PreferencesStore').getLanguage(),
      )}
      key={`cb-${network.networkName}`}
      onChange={e => {
        updateValue(e.target.name);
      }}
      name={network.networkName}
    />
  ));

  return (
    <React.Fragment>
      <div className="settings-option-container">
        <h1>{headerText}</h1>
        {mappedCheckboxes}
      </div>
    </React.Fragment>
  );
};

CityBikeNetworkSelector.propTypes = {
  updateValue: PropTypes.func.isRequired,
  headerText: PropTypes.string.isRequired,
  currentOptions: PropTypes.array.isRequired,
  isUsingCitybike: PropTypes.bool.isRequired,
};

CityBikeNetworkSelector.contextTypes = {
  config: PropTypes.object.isRequired,
  getStore: PropTypes.func.isRequired,
};

export default CityBikeNetworkSelector;
