import PropTypes from 'prop-types';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';
import { matchShape } from 'found';

import cx from 'classnames';
import { saveRoutingSettings } from '../../action/SearchSettingsActions';
import Toggle from '../Toggle';
import Icon from '../Icon';
import IconWithBigCaution from '../IconWithBigCaution';
import { isKeyboardSelectionEvent } from '../../util/browser';
import {
  getAvailableTransportModes,
  toggleTransportMode,
  isBikeRestricted,
} from '../../util/modeUtils';
import TransferOptionsSection from './TransferOptionsSection';
import CityBikeNetworkSelector from '../CityBikeNetworkSelector';
import { getCitybikeNetworks } from '../../util/citybikes';

const TransportModesSection = (
  { config, defaultSettings, currentSettings },
  { match, intl, executeAction },
  transportModes = getAvailableTransportModes(config),
  modes = currentSettings.modes,
) => (
  <React.Fragment>
    <div className="transport-mode-subheader settings-header">
      <FormattedMessage id="pick-mode" defaultMessage="Transportation modes" />
    </div>
    <div className="transport-modes-container">
      {transportModes.map(mode => (
        <div
          className="mode-option-container"
          key={`mode-option-${mode.toLowerCase()}`}
        >
          <div
            role="button"
            tabIndex={0}
            aria-label={`${mode.toLowerCase()}`}
            className={cx([`mode-option-block`], mode.toLowerCase(), {
              disabled: !modes.includes(mode),
            })}
            onKeyPress={e =>
              isKeyboardSelectionEvent(e) &&
              !isBikeRestricted(match.location, config, mode) &&
              executeAction(saveRoutingSettings, {
                modes: toggleTransportMode(mode, config),
              })
            }
            onClick={() =>
              !isBikeRestricted(match.location, config, mode) &&
              executeAction(saveRoutingSettings, {
                modes: toggleTransportMode(mode, config),
              })
            }
          >
            <div className="mode-icon">
              {isBikeRestricted(match.location, config, mode) ? (
                <IconWithBigCaution
                  color="currentColor"
                  className={mode.toLowerCase()}
                  img={`icon-icon_${mode.toLowerCase()}`}
                />
              ) : (
                <Icon
                  className={`${mode}-icon`}
                  img={`icon-icon_${mode.toLowerCase()}`}
                />
              )}
            </div>
            <div className="mode-name">
              <FormattedMessage
                id={mode.toLowerCase()}
                defaultMessage={mode.toLowerCase()}
              />
              {isBikeRestricted(match.location, config, mode) && (
                <span className="span-bike-not-allowed">
                  {intl.formatMessage({
                    id: `bike-not-allowed-${mode.toLowerCase()}`,
                    defaultMessage: 'Bikes are not allowed on the vehicle',
                  })}
                </span>
              )}
            </div>
          </div>
          <Toggle
            toggled={modes.filter(o2 => o2 === mode).length > 0}
            onToggle={() =>
              !isBikeRestricted(match.location, config, mode) &&
              executeAction(saveRoutingSettings, {
                modes: toggleTransportMode(mode, config),
              })
            }
            title={mode}
          />
        </div>
      ))}
      {modes.includes('CITYBIKE') &&
        config.cityBike.networks &&
        Object.keys(config.cityBike.networks).length > 1 &&
        config.transportModes.citybike &&
        config.transportModes.citybike.availableForSelection && (
          <div
            className="mode-option-container"
            style={{
              display: 'inline-block',
              width: '100%',
              padding: '10px 0px 10px 4.5em',
            }}
          >
            <div className="settings-header settings-header-citybike">
              <FormattedMessage
                id="citybike-network-header"
                defaultMessage={intl.formatMessage({
                  id: 'citybike-network-headers',
                  defaultMessage: 'Citybikes and scooters',
                })}
              />
            </div>
            <CityBikeNetworkSelector
              isUsingCitybike={modes.includes('CITYBIKE')}
              currentOptions={getCitybikeNetworks(config)}
            />
          </div>
        )}
      <TransferOptionsSection
        defaultSettings={defaultSettings}
        currentSettings={currentSettings}
        walkBoardCostHigh={config.walkBoardCostHigh}
      />
    </div>
  </React.Fragment>
);

TransportModesSection.propTypes = {
  config: PropTypes.object.isRequired,
  currentSettings: PropTypes.object.isRequired,
  defaultSettings: PropTypes.object.isRequired,
};

TransportModesSection.contextTypes = {
  intl: intlShape.isRequired,
  match: matchShape.isRequired,
  executeAction: PropTypes.func.isRequired,
};

export default TransportModesSection;
