import PropTypes from 'prop-types';
import React from 'react';
import xor from 'lodash/xor';
import Toggle from './Toggle';
import { saveRoutingSettings } from '../../action/SearchSettingsActions';
import Icon from '../Icon';
import {
  mapDefaultNetworkProperties,
  getCityBikeNetworkName,
  getCityBikeNetworkConfig,
  updateCitybikeNetworks,
  getCitybikeNetworks,
} from '../../util/citybikes';
import { getModes } from '../../util/modeUtils';
import { TransportMode } from '../../constants';

const CityBikeNetworkSelector = (
  { currentOptions },
  { config, getStore, executeAction },
) => (
  <React.Fragment>
    {mapDefaultNetworkProperties(config).map(network => (
      <div
        className="mode-option-container"
        key={`cb-${network.networkName}`}
        style={{ height: '3.5em' }}
      >
        <label
          htmlFor={`settings-toggle-bike-${network.networkName}`}
          className="mode-option-block toggle-label"
        >
          <div className="mode-icon">
            <Icon
              className={`${network.icon}-icon ${network.operator}`}
              // append formfactor
              // img={`icon-icon_${network.icon}`}
              img={`icon-icon_rental_${network.form_factors[0]}`}
              height={1}
              width={1}
            />
          </div>
          <span className="mode-name">
            {getCityBikeNetworkName(
              getCityBikeNetworkConfig(network.networkName, config),
              getStore('PreferencesStore').getLanguage(),
            )}
          </span>
          <Toggle
            id={`settings-toggle-bike-${network.networkName}`}
            toggled={
              !!currentOptions &&
              currentOptions.filter(
                option =>
                  option.toLowerCase() === network.networkName.toLowerCase(),
              ).length > 0
            }
            onToggle={() => {
              const newNetworks = updateCitybikeNetworks(
                getCitybikeNetworks(config),
                network.networkName,
              );
              const modes = getModes(config);
              const newSettings = { allowedVehicleRentalNetworks: newNetworks };
              if (newNetworks.length > 0) {
                if (modes.indexOf(TransportMode.Citybike) === -1) {
                  newSettings.modes = xor(modes, [TransportMode.Citybike]);
                }
              } else if (modes.indexOf(TransportMode.Citybike) !== -1) {
                newSettings.modes = xor(modes, [TransportMode.Citybike]);
              }
              executeAction(saveRoutingSettings, newSettings);
            }}
          />
        </label>
      </div>
    ))}
  </React.Fragment>
);

CityBikeNetworkSelector.propTypes = {
  currentOptions: PropTypes.array.isRequired,
};

CityBikeNetworkSelector.contextTypes = {
  config: PropTypes.object.isRequired,
  getStore: PropTypes.func.isRequired,
  executeAction: PropTypes.func.isRequired,
};

export default CityBikeNetworkSelector;
