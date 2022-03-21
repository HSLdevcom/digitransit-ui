import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';

import Icon from './Icon';
import FareZoneSelector from './customizesearch/FareZoneSelector';
import StreetModeSelectorPanel from './customizesearch/StreetModeSelectorPanel';
import TransportModesSection from './customizesearch/TransportModesSection';
import WalkingOptionsSection from './customizesearch/WalkingOptionsSection';
import AccessibilityOptionSection from './customizesearch/AccessibilityOptionSection';
import TransferOptionsSection from './customizesearch/TransferOptionsSection';
import CityBikeNetworkSelector from './customizesearch/CityBikeNetworkSelector';
import { showModeSettings, useCitybikes } from '../util/modeUtils';
import ScrollableWrapper from './ScrollableWrapper';
import { getDefaultSettings } from '../util/planParamUtil';
import { getCitybikeNetworks } from '../util/citybikes';

class CustomizeSearch extends React.Component {
  static contextTypes = {
    intl: intlShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    onToggleClick: PropTypes.func.isRequired,
    customizedSettings: PropTypes.object.isRequired,
    mobile: PropTypes.bool,
  };

  static defaultProps = {
    mobile: false,
  };

  defaultSettings = getDefaultSettings(this.context.config);

  render() {
    const { config, intl } = this.context;
    const { onToggleClick, customizedSettings, mobile } = this.props;
    // Merge default and customized settings
    const currentSettings = { ...this.defaultSettings, ...customizedSettings };
    let ticketOptions = [];
    if (config.showTicketSelector && config.availableTickets) {
      Object.keys(config.availableTickets).forEach(key => {
        if (config.feedIds.indexOf(key) > -1) {
          ticketOptions = ticketOptions.concat(
            Object.keys(config.availableTickets[key]),
          );
        }
      });

      ticketOptions.sort((a, b) => {
        return a.split('').reverse() > b.split('').reverse() ? 1 : -1;
      });
    }
    const backIcon = mobile ? (
      <Icon className="close-icon" img="icon-icon_arrow-collapse--left" />
    ) : (
      <Icon className="close-icon" img="icon-icon_close" />
    );
    return (
      <form className="customize-search">
        <button
          aria-label={intl.formatMessage({
            id: 'close-settings',
          })}
          type="button"
          className="close-offcanvas"
          onClick={() => {
            // Move focus back to the button that opened settings window
            const openSettingsButton = document.querySelector(
              '.open-advanced-settings-window-button',
            );
            if (openSettingsButton) {
              openSettingsButton.focus();
            }
            onToggleClick();
          }}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
        >
          {backIcon}
        </button>
        <div className="settings-option-container">
          <h2>
            {intl.formatMessage({
              id: 'settings',
              defaultMessage: 'Settings',
            })}
          </h2>
        </div>
        <ScrollableWrapper>
          <div className="settings-section compact-settings-section">
            <WalkingOptionsSection
              walkSpeedOptions={config.defaultOptions.walkSpeed}
              walkReluctanceOptions={config.defaultOptions.walkReluctance}
              currentSettings={currentSettings}
              defaultSettings={this.defaultSettings}
            />
          </div>
          <div className="settings-section">
            {showModeSettings(config) && (
              <div className="settings-option-container">
                <TransportModesSection config={config} />
              </div>
            )}
            <div className="settings-option-container">
              <TransferOptionsSection
                defaultSettings={this.defaultSettings}
                currentSettings={currentSettings}
                walkBoardCostHigh={config.walkBoardCostHigh}
              />
            </div>
          </div>
          {useCitybikes(config?.cityBike?.networks) && (
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
          )}
          <div className="settings-section">
            <div className="settings-option-container">
              <StreetModeSelectorPanel
                currentSettings={currentSettings}
                defaultSettings={this.defaultSettings}
              />
            </div>
          </div>
          <div className="settings-section">
            <div className="settings-option-container">
              <AccessibilityOptionSection currentSettings={currentSettings} />
            </div>
          </div>
          {config.showTicketSelector && (
            <div className="settings-section">
              <FareZoneSelector
                options={ticketOptions}
                currentOption={currentSettings.ticketTypes}
              />
            </div>
          )}
        </ScrollableWrapper>
      </form>
    );
  }
}

const withStore = connectToStores(
  CustomizeSearch,
  ['RoutingSettingsStore'],
  context => ({
    customizedSettings: context
      .getStore('RoutingSettingsStore')
      .getRoutingSettings(),
  }),
);

export { withStore as default, CustomizeSearch as component };
