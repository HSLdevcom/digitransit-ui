import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Toggle from './Toggle';
import Icon from './Icon';
import { saveRoutingSettings } from '../action/SearchSettingsActions';
import BikingOptionsSection from './customizesearch/BikingOptionsSection';
import { toggleStreetMode } from '../util/modeUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';

const StreetModeSelectorPanel = (
  { streetModeConfigs, currentSettings, defaultSettings, selectedStreetMode },
  { config, executeAction },
) => (
  <React.Fragment>
    <div className="street-modes-container">
      <div className="transport-mode-subheader settings-header">
        <FormattedMessage
          id="pick-street-mode"
          defaultMessage="Your own transportation modes"
        />
      </div>
      {streetModeConfigs
        .filter(mode => mode.availableForSelection && !mode.defaultValue)
        .map(mode => (
          <div key={`mode-option-${mode.name}`}>
            <div className="mode-option-container">
              <div className="mode-option-block">
                <div className="mode-icon">
                  <Icon
                    className={`${mode}-icon`}
                    img={`icon-icon_${mode.icon}`}
                  />
                </div>
                <div className="mode-name">
                  <FormattedMessage
                    className="mode-name"
                    id={mode.name.toLowerCase()}
                    defaultMessage={mode.name.toLowerCase()}
                  />
                </div>
              </div>
              <div>
                <Toggle
                  toggled={selectedStreetMode === mode.name}
                  onToggle={() => {
                    executeAction(saveRoutingSettings, {
                      selectedStreetMode: toggleStreetMode(
                        mode.name.toUpperCase(),
                        config,
                      ),
                    });
                    addAnalyticsEvent({
                      action: 'SelectTravelingModeFromSettings',
                      category: 'ItinerarySettings',
                      name: selectedStreetMode,
                    });
                  }}
                />
              </div>
            </div>
            {selectedStreetMode === 'BICYCLE' &&
              mode.name === 'BICYCLE' && (
                <BikingOptionsSection
                  bikeSpeed={currentSettings.bikeSpeed}
                  defaultSettings={defaultSettings}
                  bikeSpeedOptions={config.defaultOptions.bikeSpeed}
                />
              )}
          </div>
        ))}
    </div>
  </React.Fragment>
);

StreetModeSelectorPanel.propTypes = {
  selectedStreetMode: PropTypes.string,
  currentSettings: PropTypes.object.isRequired,
  defaultSettings: PropTypes.object.isRequired,
  streetModeConfigs: PropTypes.arrayOf(
    PropTypes.shape({
      defaultValue: PropTypes.bool.isRequired,
      icon: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ),
};

StreetModeSelectorPanel.contextTypes = {
  config: PropTypes.object.isRequired,
  executeAction: PropTypes.func.isRequired,
};

StreetModeSelectorPanel.defaultProps = {
  selectedStreetMode: undefined,
  streetModeConfigs: [],
};

export default StreetModeSelectorPanel;
