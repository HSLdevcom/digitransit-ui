import PropTypes from 'prop-types';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';
import { matchShape, routerShape } from 'found';

import cx from 'classnames';
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
import {
  updateCitybikeNetworks,
  getCitybikeNetworks,
} from '../../util/citybikes';

const TransportModesSection = (
  { config, currentSettings, defaultSettings },
  { intl, router, match },
) => {
  const transportModes = getAvailableTransportModes(config);
  const currentModes = currentSettings.modes;
  return (
    <React.Fragment>
      <div className="transport-mode-subheader">
        <FormattedMessage
          id="pick-mode"
          defaultMessage="Transportation modes"
        />
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
                disabled: !currentModes.includes(mode),
              })}
              onKeyPress={e =>
                isKeyboardSelectionEvent(e) &&
                !isBikeRestricted(match.location, config, mode) &&
                toggleTransportMode(mode, config, router, match)
              }
              onClick={() =>
                !isBikeRestricted(match.location, config, mode) &&
                toggleTransportMode(mode, config, router, match)
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
              toggled={currentModes.filter(o2 => o2 === mode).length > 0}
              onToggle={() =>
                !isBikeRestricted(match.location, config, mode) &&
                toggleTransportMode(mode, config, router, match)
              }
              title={mode}
            />
          </div>
        ))}
        {currentModes.includes('CITYBIKE') &&
          config.cityBike.networks &&
          Object.keys(config.cityBike.networks).length > 1 &&
          config.transportModes.citybike &&
          config.transportModes.citybike.availableForSelection && (
            <div
              className="mode-option-container"
              style={{
                display: 'inline-block',
                width: '100%',
                padding: '10px 0px 0px 30px',
              }}
            >
              <FormattedMessage
                id="citybike-network-header"
                defaultMessage={intl.formatMessage({
                  id: 'citybike-network-headers',
                  defaultMessage: 'Citybikes and scooters',
                })}
              />
              <CityBikeNetworkSelector
                isUsingCitybike={currentModes.includes('CITYBIKE')}
                currentOptions={getCitybikeNetworks(match.location, config)}
                updateValue={value =>
                  updateCitybikeNetworks(
                    getCitybikeNetworks(match.location, config),
                    value.toUpperCase(),
                    config,
                    router,
                    currentModes.includes('CITYBIKE'),
                    match,
                  )
                }
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
};

TransportModesSection.propTypes = {
  config: PropTypes.object.isRequired,
  currentSettings: PropTypes.object.isRequired,
  defaultSettings: PropTypes.object.isRequired,
};

TransportModesSection.contextTypes = {
  intl: intlShape.isRequired,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
};

export default TransportModesSection;
