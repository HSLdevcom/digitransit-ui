import PropTypes from 'prop-types';
import React from 'react';
import xor from 'lodash/xor';
import Toggle from './Toggle';
import { saveRoutingSettings } from '../../action/SearchSettingsActions';
import Icon from '../Icon';
import {
  getSharingOperatorsByFormFactor,
  toggleSharingOperator,
} from '../../util/citybikes';
import { getModes } from '../../util/modeUtils';
import { TransportMode } from '../../constants';

const SharingOperatorSelector = (
  { currentOptions, formFactor },
  { config, getStore, executeAction },
) => (
  <>
    {
      // TODO sortieren
      getSharingOperatorsByFormFactor(formFactor, config).map(operator => (
        <div
          className="mode-option-container"
          key={`cb-${formFactor}-${operator.operatorId}`}
          style={{ height: '3.5em' }}
        >
          <label
            htmlFor={`settings-toggle-${formFactor}-${operator.operatorId}`}
            className="mode-option-block toggle-label"
          >
            <div className="mode-icon">
              <Icon
                className={`${operator.icon}-icon ${operator.operatorId}`}
                img={
                  operator.icon
                    ? `icon-icon_${operator.icon}`
                    : `icon-icon_rental_${formFactor}`
                }
                height={1}
                width={1}
              />
            </div>
            <span className="mode-name">
              {operator.name?.[getStore('PreferencesStore').getLanguage()]}
            </span>
            <Toggle
              id={`settings-toggle-${formFactor}-${operator.operatorId}`}
              toggled={
                !!currentOptions &&
                currentOptions.filter(option => option === operator.operatorId)
                  .length > 0
              }
              onToggle={() => {
                const newNetworks = toggleSharingOperator(
                  // TODO: for now, we ignore formFactor, this should be added later
                  operator.operatorId,
                  config,
                );
                const modes = getModes(config);
                const newSettings = {
                  allowedVehicleRentalNetworks: newNetworks,
                };
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
      ))
    }
  </>
);

SharingOperatorSelector.propTypes = {
  currentOptions: PropTypes.array.isRequired,
  formFactor: PropTypes.string.isRequired, // TODO conert to enum
};

SharingOperatorSelector.contextTypes = {
  config: PropTypes.object.isRequired,
  getStore: PropTypes.func.isRequired,
  executeAction: PropTypes.func.isRequired,
};

export default SharingOperatorSelector;
