import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Toggle from '../Toggle';
import Icon from '../Icon';
import { saveRoutingSettings } from '../../action/SearchSettingsActions';
import BikingOptionsSection from './BikingOptionsSection';
import { addAnalyticsEvent } from '../../util/analyticsUtils';

const StreetModeSelectorPanel = (
  { currentSettings, defaultSettings },
  { config, executeAction },
) => {
  const onToggle = () => {
    addAnalyticsEvent({
      category: 'ItinerarySettings',
      action: `Settings${
        currentSettings.includeBikeSuggestions ? 'Disable' : 'Enable'
      }OwnBike`,
      name: null,
    });
    executeAction(saveRoutingSettings, {
      includeBikeSuggestions: !currentSettings.includeBikeSuggestions,
    });
  };

  return (
    <React.Fragment>
      <div className="street-modes-container">
        <div className="transport-mode-subheader settings-header">
          <FormattedMessage
            id="pick-street-mode"
            defaultMessage="Your own transportation modes"
          />
        </div>
        <div key="mode-option-bicycle">
          <div className="mode-option-container">
            <div className="mode-option-block">
              <div className="mode-icon">
                <Icon className="bicycle-icon" img="icon-icon_bike" />
              </div>
              <div className="mode-name">
                <FormattedMessage
                  className="mode-name"
                  id="bicycle"
                  defaultMessage="bicycle"
                />
              </div>
            </div>
            <div>
              <Toggle
                toggled={currentSettings.includeBikeSuggestions}
                onToggle={() => onToggle()}
              />
            </div>
          </div>
        </div>
        {currentSettings.includeBikeSuggestions ? (
          <BikingOptionsSection
            bikeSpeed={currentSettings.bikeSpeed}
            defaultSettings={defaultSettings}
            bikeSpeedOptions={config.defaultOptions.bikeSpeed}
          />
        ) : null}
      </div>
    </React.Fragment>
  );
};

StreetModeSelectorPanel.propTypes = {
  currentSettings: PropTypes.object.isRequired,
  defaultSettings: PropTypes.object.isRequired,
};

StreetModeSelectorPanel.contextTypes = {
  config: PropTypes.object.isRequired,
  executeAction: PropTypes.func.isRequired,
};

export default StreetModeSelectorPanel;
