import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Toggle from './Toggle';
import Icon from '../Icon';
import { saveRoutingSettings } from '../../action/SearchSettingsActions';
import BikingOptionsSection from './BikingOptionsSection';
import { addAnalyticsEvent } from '../../util/analyticsUtils';

const StreetModeSelectorPanel = (
  { currentSettings, defaultSettings },
  { config, executeAction },
) => {
  const onToggle = (propName, eventName) => {
    const state = currentSettings[propName] ? 'Disable' : 'Enable';
    addAnalyticsEvent({
      category: 'ItinerarySettings',
      action: `Settings${state}${eventName}`,
      name: null,
    });
    const action = {};
    action[propName] = !currentSettings[propName];
    executeAction(saveRoutingSettings, action);
  };

  const prId =
    config.includeParkAndRideSuggestions && config.includeCarSuggestions
      ? 'park-and-ride'
      : 'car';

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
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label className="mode-name" htmlFor="settings-toggle-bicycle">
                <FormattedMessage
                  className="mode-name"
                  id="bicycle"
                  defaultMessage="bicycle"
                />
              </label>
            </div>
            <div>
              <Toggle
                id="settings-toggle-bicycle"
                toggled={currentSettings.includeBikeSuggestions}
                onToggle={() => onToggle('includeBikeSuggestions', 'OwnBike')}
              />
            </div>
          </div>
          {currentSettings.includeBikeSuggestions ? (
            <BikingOptionsSection
              bikeSpeed={currentSettings.bikeSpeed}
              bicycleParkingFilter={currentSettings.bicycleParkingFilter}
              defaultSettings={defaultSettings}
              bikeSpeedOptions={config.defaultOptions.bikeSpeed}
            />
          ) : null}
        </div>
        {config.includeParkAndRideSuggestions && (
          <div key="mode-option-park-and-ride">
            <div className="mode-option-container">
              <div className="mode-option-block">
                <div className="mode-icon">
                  <Icon
                    className="park-ride-icon-icon"
                    img="icon-icon_park-and-ride-subicon"
                  />
                </div>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label
                  className="mode-name"
                  htmlFor="settings-toggle-parkAndRide"
                >
                  <FormattedMessage
                    className="mode-name"
                    id={prId}
                    defaultMessage="Park & Ride"
                  />
                  <Toggle
                    id="settings-toggle-parkAndRide"
                    toggled={currentSettings.includeParkAndRideSuggestions}
                    onToggle={() =>
                      onToggle('includeParkAndRideSuggestions', 'ParkAndRide')
                    }
                  />
                </label>
              </div>
            </div>
          </div>
        )}
        {config.includeCarSuggestions && (
          <div key="mode-option-car">
            <div className="mode-option-container">
              <div className="mode-option-block">
                <div className="mode-icon">
                  <Icon className="car-icon" img="icon-icon_car-withoutBox" />
                </div>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label className="mode-name" htmlFor="settings-toggle-car">
                  <FormattedMessage
                    className="mode-name"
                    id="car"
                    defaultMessage="Car"
                  />
                  <Toggle
                    id="settings-toggle-car"
                    toggled={currentSettings.includeCarSuggestions}
                    onToggle={() => onToggle('includeCarSuggestions', 'OwnCar')}
                  />
                </label>
              </div>
            </div>
          </div>
        )}
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
