import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from 'react-intl';
import { getCitybikeNetworks } from '../../util/citybikes';
import CityBikeNetworkSelector from './CityBikeNetworkSelector';

const SharingSettingsPanel = (props, { config, intl }) => (
  <React.Fragment>
    <div className="settings-section">
      <div className="settings-option-container">
        <fieldset>
          <legend className="settings-header transport-mode-subheader">
            <FormattedMessage
              id="citybike-network-header"
              defaultMessage={intl.formatMessage({
                id: 'citybike-network-headers',
                defaultMessage: 'Citybikes and scooters',
              })}
            />
          </legend>
          <div className="transport-modes-container">
            <CityBikeNetworkSelector
              currentOptions={getCitybikeNetworks(config)}
            />
          </div>
        </fieldset>
      </div>
    </div>
  </React.Fragment>
);

SharingSettingsPanel.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

export default SharingSettingsPanel;
