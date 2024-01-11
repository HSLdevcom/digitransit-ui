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

  const overrideStyle = config.separatedParkAndRideSwitch
    ? { borderBottom: '1px solid #e3e3e3' }
    : {};

  const prId =
    config.includeParkAndRideSuggestions && config.includeCarSuggestions
      ? 'park-and-ride'
      : 'car';
  const prIcon =
    config.includeParkAndRideSuggestions && config.includeCarSuggestions
      ? 'icon-icon_car_park-withoutBox'
      : 'icon-icon_car-withoutBox';

  return (
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
              <Toggle
                id="settings-toggle-bicycle"
                toggled={currentSettings.includeBikeSuggestions}
                onToggle={() => onToggle('includeBikeSuggestions', 'OwnBike')}
              />
            </label>
          </div>
        </div>
        {!config.includePublicWithBikePlan ||
        currentSettings.includeBikeSuggestions ? (
          <BikingOptionsSection
            bikeSpeed={currentSettings.bikeSpeed}
            defaultSettings={defaultSettings}
            bikeSpeedOptions={config.defaultOptions.bikeSpeed}
            overrideStyle={overrideStyle}
          />
        ) : null}
        {config.showBikeAndParkItineraries &&
        !config.includePublicWithBikePlan ? (
          <div className="settings-mode-option-container">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label
              className="settings-mode-option-label"
              htmlFor="settings-toggle-bikeAndPark"
            >
              <p className="settings-mode-option-label-text">
                <FormattedMessage
                  className="mode-name"
                  id="park-and-ride"
                  defaultMessage="Park and ride"
                />
              </p>
              <span className="settings-mode-option-label-text-container">
                <p className="settings-mode-option-label-value" />
                <Toggle
                  id="settings-toggle-bikeAndPark"
                  toggled={currentSettings.showBikeAndParkItineraries}
                  onToggle={() =>
                    onToggle('showBikeAndParkItineraries', 'BikeAndPark')
                  }
                />
              </span>
            </label>
          </div>
        ) : null}
      </div>
      {config.includeParkAndRideSuggestions &&
        !config.separatedParkAndRideSwitch && (
          <div key="mode-option-park-and-ride">
            <div className="mode-option-container">
              <div className="mode-option-block">
                <div className="mode-icon">
                  <Icon className="car-icon" img={prIcon} />
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
          {config.includeParkAndRideSuggestions &&
          config.separatedParkAndRideSwitch ? (
            <div className="settings-mode-option-container">
              <label
                className="settings-mode-option-label"
                htmlFor="settings-toggle-parkAndRide"
              >
                <p className="settings-mode-option-label-text">
                  <FormattedMessage
                    className="mode-name"
                    id="park-and-ride"
                    defaultMessage="Park and ride"
                  />
                </p>
                <span className="settings-mode-option-label-text-container">
                  <p className="settings-mode-option-label-value">
                    {/* eslint-disable-next-line no-nested-ternary */}
                  </p>
                  <Toggle
                    id="settings-toggle-parkAndRide"
                    toggled={currentSettings.includeParkAndRideSuggestions}
                    onToggle={() =>
                      onToggle('includeParkAndRideSuggestions', 'ParkAndRide')
                    }
                  />
                </span>
              </label>
            </div>
          ) : null}
        </div>
      )}
    </div>
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
