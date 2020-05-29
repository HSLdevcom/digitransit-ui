import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';

import Icon from './Icon';
import FareZoneSelector from './FareZoneSelector';
import StreetModeSelectorPanel from './StreetModeSelectorPanel';
import TransportModesSection from './customizesearch/TransportModesSection';
import WalkingOptionsSection from './customizesearch/WalkingOptionsSection';
import AccessibilityOptionSection from './customizesearch/AccessibilityOptionSection';
import * as ModeUtils from '../util/modeUtils';
import { getDefaultSettings } from '../util/planParamUtil';

class CustomizeSearch extends React.Component {
  static contextTypes = {
    intl: intlShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    onToggleClick: PropTypes.func.isRequired,
    customizedSettings: PropTypes.object.isRequired,
  };

  defaultSettings = getDefaultSettings(this.context.config);

  render() {
    const { config, intl } = this.context;
    const { onToggleClick, customizedSettings } = this.props;
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

    return (
      <div className="customize-search">
        <button className="close-offcanvas" onClick={onToggleClick}>
          <Icon className="close-icon" img="icon-icon_close" />
        </button>
        <div className="settings-option-container">
          <h1>
            {intl.formatMessage({
              id: 'settings',
              defaultMessage: 'Settings',
            })}
          </h1>
        </div>
        <div className="settings-option-container">
          <WalkingOptionsSection
            walkSpeedOptions={config.defaultOptions.walkSpeed}
            currentSettings={currentSettings}
            defaultSettings={this.defaultSettings}
          />
        </div>
        <div className="settings-option-container">
          <TransportModesSection
            config={config}
            currentSettings={currentSettings}
            defaultSettings={this.defaultSettings}
          />
        </div>
        <div className="settings-option-container">
          <StreetModeSelectorPanel
            selectedStreetMode={ModeUtils.getStreetMode(config)}
            streetModeConfigs={ModeUtils.getAvailableStreetModeConfigs(config)}
            currentSettings={currentSettings}
            defaultSettings={this.defaultSettings}
          />
        </div>
        <div className="settings-option-container">
          <AccessibilityOptionSection currentSettings={currentSettings} />
        </div>
        {config.showTicketSelector && (
          <FareZoneSelector
            options={ticketOptions}
            currentOption={currentSettings.ticketTypes || 'none'}
          />
        )}
      </div>
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
