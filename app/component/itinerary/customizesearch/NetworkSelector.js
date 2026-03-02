import PropTypes from 'prop-types';
import React from 'react';
import Icon from '../../Icon';
import SettingsToggle from './SettingsToggle';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import {
  mapDefaultNetworkProperties,
  getRentalNetworkName,
  getRentalNetworkConfig,
  updateVehicleNetworks,
  getScooterNetworks,
  getCitybikeNetworks,
} from '../../../util/vehicleRentalUtils';
import { TransportMode } from '../../../constants';
import { useConfigContext } from '../../../configurations/ConfigContext';

export default function NetworkSelector({ type }, { executeAction }) {
  const config = useConfigContext();
  const networks = mapDefaultNetworkProperties(config).filter(
    network => network.type === type.toLowerCase(),
  );
  const last = networks.length ? networks[networks.length - 1] : undefined;
  const selected =
    type === TransportMode.Scooter
      ? getScooterNetworks(config)
      : getCitybikeNetworks(config);

  return (
    <>
      {networks.map(network => (
        <SettingsToggle
          label={getRentalNetworkName(
            getRentalNetworkConfig(network.networkName, config),
            config.language,
          )}
          key={`toggle-network-${network.networkName}`}
          id={`toggle-network-${network.networkName}`}
          leftElement={
            <Icon
              className={`${network.icon}-icon`}
              img={`icon_${network.icon}`}
              height={2}
              width={2}
            />
          }
          toggled={
            !!selected.find(
              o => o.toLowerCase() === network.networkName.toLowerCase(),
            )
          }
          onToggle={() => {
            const newNetworks = updateVehicleNetworks(
              selected,
              network.networkName,
              network.type,
            );
            const newSettings =
              type === TransportMode.Scooter
                ? { scooterNetworks: newNetworks }
                : { allowedBikeRentalNetworks: newNetworks };
            executeAction(saveRoutingSettings, newSettings);
          }}
          borderStyle={network === last ? '' : 'bottom-border'}
        />
      ))}
    </>
  );
}

NetworkSelector.propTypes = {
  type: PropTypes.string.isRequired,
};

NetworkSelector.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};
