/* eslint-disable jsx-a11y/label-has-associated-control */
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';

import cx from 'classnames';
import { saveRoutingSettings } from '../../action/SearchSettingsActions';
import Toggle from '../Toggle';
import Icon from '../Icon';
import {
  getAvailableTransportModes,
  getModes,
  toggleTransportMode,
} from '../../util/modeUtils';
import CityBikeNetworkSelector from '../CityBikeNetworkSelector';
import { getCitybikeNetworks } from '../../util/citybikes';

const TransportModesSection = (
  { config },
  { intl, executeAction },
  transportModes = getAvailableTransportModes(config),
  modes = getModes(config),
) => (
  <fieldset>
    <legend className="transport-mode-subheader settings-header">
      <FormattedMessage id="pick-mode" defaultMessage="Transportation modes" />
    </legend>
    <div className="transport-modes-container">
      {transportModes.map(mode => (
        <div
          className="mode-option-container"
          key={`mode-option-${mode.toLowerCase()}`}
        >
          <label
            htmlFor={`settings-toggle-${mode}`}
            className={cx(
              [`mode-option-block`, 'toggle-label'],
              mode.toLowerCase(),
              {
                disabled: !modes.includes(mode),
              },
            )}
          >
            <div className="mode-icon">
              <Icon
                className={`${mode}-icon`}
                img={`icon-icon_${mode.toLowerCase()}`}
              />
            </div>
            <div className="mode-name">
              <FormattedMessage
                id={mode.toLowerCase()}
                defaultMessage={mode.toLowerCase()}
              />
            </div>
          </label>
          <Toggle
            id={`settings-toggle-${mode}`}
            toggled={modes.filter(o2 => o2 === mode).length > 0}
            onToggle={() =>
              executeAction(saveRoutingSettings, {
                modes: toggleTransportMode(mode, config),
              })
            }
          />
        </div>
      ))}
      {modes.includes('CITYBIKE') &&
        config.cityBike.networks &&
        Object.keys(config.cityBike.networks).length > 1 && (
          <fieldset
            className="mode-option-container"
            style={{
              display: 'inline-block',
              width: '100%',
              padding: '10px 0px 10px 66.24px',
            }}
          >
            <legend className="settings-header settings-header-citybike">
              <FormattedMessage
                id="citybike-network-header"
                defaultMessage={intl.formatMessage({
                  id: 'citybike-network-headers',
                  defaultMessage: 'Citybikes and scooters',
                })}
              />
            </legend>
            <CityBikeNetworkSelector
              isUsingCitybike={modes.includes('CITYBIKE')}
              currentOptions={getCitybikeNetworks(config)}
            />
          </fieldset>
        )}
    </div>
  </fieldset>
);

TransportModesSection.propTypes = {
  config: PropTypes.object.isRequired,
};

TransportModesSection.contextTypes = {
  intl: intlShape.isRequired,
  executeAction: PropTypes.func.isRequired,
};

export default TransportModesSection;
