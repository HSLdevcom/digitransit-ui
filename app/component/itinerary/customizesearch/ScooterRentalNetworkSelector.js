import PropTypes from 'prop-types';
import React from 'react';
import xor from 'lodash/xor';
import Toggle from '../../Toggle';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import Icon from '../../Icon';
import {
  mapDefaultNetworkProperties,
  getVehicleRentalStationNetworkName,
  getVehicleRentalStationNetworkConfig,
  updateVehicleNetworks,
  getScooterRentalNetworks,
} from '../../../util/vehicleRentalUtils';
import { getModes } from '../../../util/modeUtils';
import { TransportMode } from '../../../constants';

const ScooterRentalNetworkSelector = (
  { currentOptions },
  { config, getStore, executeAction },
) => (
  <React.Fragment>
    {mapDefaultNetworkProperties(config)
      .filter(network => network.type === TransportMode.Scooter.toLowerCase())
      .map(network => (
        <div
          className="mode-option-container"
          key={`cb-${network.networkName}`}
          style={{ height: '3.5em' }}
        >
          <label
            htmlFor={`settings-toggle-scooter-${network.networkName}`}
            className="mode-option-block toggle-label"
          >
            <div className="mode-icon">
              <Icon
                className={`${network.icon}-icon`}
                img={`icon-icon_${network.icon}`}
                height={1}
                width={1}
              />
            </div>
            <span className="mode-name">
              {getVehicleRentalStationNetworkName(
                getVehicleRentalStationNetworkConfig(
                  network.networkName,
                  config,
                ),
                getStore('PreferencesStore').getLanguage(),
              )}
            </span>
            <Toggle
              id={`settings-toggle-scooter-${network.networkName}`}
              toggled={
                !!currentOptions &&
                currentOptions.filter(
                  option =>
                    option.toLowerCase() === network.networkName.toLowerCase(),
                ).length > 0
              }
              onToggle={() => {
                const newNetworks = updateVehicleNetworks(
                  getScooterRentalNetworks(config),
                  network.networkName,
                );
                const modes = getModes(config);
                const newSettings = {
                  allowedScooterRentalNetworks: newNetworks,
                };
                if (newNetworks.length > 0) {
                  if (modes.indexOf(TransportMode.Scooter) === -1) {
                    newSettings.modes = xor(modes, [TransportMode.Scooter]);
                  }
                } else if (modes.indexOf(TransportMode.Scooter) !== -1) {
                  newSettings.modes = xor(modes, [TransportMode.Scooter]);
                }
                executeAction(saveRoutingSettings, newSettings);
              }}
            />
          </label>
        </div>
      ))}
  </React.Fragment>
);

ScooterRentalNetworkSelector.propTypes = {
  currentOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
};

ScooterRentalNetworkSelector.contextTypes = {
  config: PropTypes.shape({
    transportModes: PropTypes.shape({
      scooter: PropTypes.shape({
        networks: PropTypes.arrayOf(PropTypes.string),
      }),
    }),
  }).isRequired,
  getStore: PropTypes.func.isRequired,
  executeAction: PropTypes.func.isRequired,
};

export default ScooterRentalNetworkSelector;
