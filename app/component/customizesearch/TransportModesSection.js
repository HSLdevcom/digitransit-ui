import PropTypes from 'prop-types';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';
import { matchShape } from 'found';

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
import { getCitybikeNetworks } from '../../util/citybikes';

class TransportModesSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = { modes: props.currentSettings.modes };
  }

  render() {
    const { config, defaultSettings } = this.props;
    const { match, intl } = this.context;
    const transportModes = getAvailableTransportModes(config);
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
                  disabled: !this.state.modes.includes(mode),
                })}
                onKeyPress={e =>
                  isKeyboardSelectionEvent(e) &&
                  !isBikeRestricted(match.location, config, mode) &&
                  this.setState({
                    modes: toggleTransportMode(mode, config, match),
                  })
                }
                onClick={() =>
                  !isBikeRestricted(match.location, config, mode) &&
                  this.setState({
                    modes: toggleTransportMode(mode, config, match),
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
                toggled={this.state.modes.filter(o2 => o2 === mode).length > 0}
                onToggle={() =>
                  !isBikeRestricted(match.location, config, mode) &&
                  this.setState({
                    modes: toggleTransportMode(mode, config, match),
                  })
                }
                title={mode}
              />
            </div>
          ))}
          {this.state.modes.includes('CITYBIKE') &&
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
                  isUsingCitybike={this.state.modes.includes('CITYBIKE')}
                  currentOptions={getCitybikeNetworks(config)}
                />
              </div>
            )}
          <TransferOptionsSection
            defaultSettings={defaultSettings}
            currentSettings={this.props.currentSettings}
            walkBoardCostHigh={config.walkBoardCostHigh}
          />
        </div>
      </React.Fragment>
    );
  }
}

TransportModesSection.propTypes = {
  config: PropTypes.object.isRequired,
  currentSettings: PropTypes.object.isRequired,
  defaultSettings: PropTypes.object.isRequired,
};

TransportModesSection.contextTypes = {
  intl: intlShape.isRequired,
  match: matchShape.isRequired,
};

export default TransportModesSection;
