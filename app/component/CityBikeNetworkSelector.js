import PropTypes from 'prop-types';
import React from 'react';
import Toggle from './Toggle';
import { saveRoutingSettings } from '../action/SearchSettingsActions';
import Icon from './Icon';
import {
  mapDefaultNetworkProperties,
  getCityBikeNetworkName,
  getCityBikeNetworkConfig,
  updateCitybikeNetworks,
  getCitybikeNetworks,
} from '../util/citybikes';

const CityBikeNetworkSelector = (
  { isUsingCitybike, currentOptions },
  { config, getStore, executeAction },
) => (
  <React.Fragment>
    {mapDefaultNetworkProperties(config)
      .filter(network => network.visibleInSettingsUi)
      .map(network => (
        <div
          className="mode-option-block citybike-network-container"
          key={`cb-${network.networkName}`}
          style={{ height: '3.5em' }}
        >
          <label
            htmlFor={`settings-toggle-bike-${network.networkName}`}
            className="toggle-label"
          >
            <Icon
              className={`${network.icon}-icon`}
              img={`icon-icon_${network.icon}`}
              height={1}
              width={1}
            />
            <span className="network-name">
              {getCityBikeNetworkName(
                getCityBikeNetworkConfig(network.networkName, config),
                getStore('PreferencesStore').getLanguage(),
              )}
            </span>
          </label>
          <Toggle
            id={`settings-toggle-bike-${network.networkName}`}
            toggled={
              isUsingCitybike &&
              currentOptions.filter(option => option === network.networkName)
                .length > 0
            }
            onToggle={() => {
              executeAction(saveRoutingSettings, {
                allowedVehicleRentalNetworks: updateCitybikeNetworks(
                  getCitybikeNetworks(config),
                  network.networkName,
                  config,
                  isUsingCitybike,
                ),
              });
            }}
          />
        </div>
      ))}
  </React.Fragment>
);

CityBikeNetworkSelector.propTypes = {
  currentOptions: PropTypes.array.isRequired,
  isUsingCitybike: PropTypes.bool.isRequired,
};

CityBikeNetworkSelector.contextTypes = {
  config: PropTypes.object.isRequired,
  getStore: PropTypes.func.isRequired,
  executeAction: PropTypes.func.isRequired,
};

export default CityBikeNetworkSelector;
