import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { settingsShape } from '../../../util/shapes';
import SettingsToggle from './SettingsToggle';
import Icon from '../../Icon';
import BikingSpeed from './BikingSpeed';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { useConfigContext } from '../../../configurations/ConfigContext';

export default function StreetModeSelector({ settings, updateSettings }) {
  const config = useConfigContext();
  const onToggle = (propName, eventName) => {
    const state = settings[propName] ? 'Disable' : 'Enable';
    addAnalyticsEvent({
      category: 'ItinerarySettings',
      action: `Settings${state}${eventName}`,
      name: null,
    });
    const action = {};
    action[propName] = !settings[propName];
    updateSettings(action);
  };

  return (
    <div className="streetmodes">
      <div className="section-header">
        <FormattedMessage
          id="pick-street-mode"
          defaultMessage="Your own transportation modes"
        />
      </div>
      <SettingsToggle
        id="settings-toggle-bicycle"
        labelId="bicycle"
        labelStyle="mode-label"
        leftElement={
          <Icon color="#333" img="icon_bike" width={2.4} height={2.4} />
        }
        toggled={!!settings.includeBikeSuggestions}
        onToggle={() => onToggle('includeBikeSuggestions', 'OwnBike')}
        borderStyle="bottom-border"
      />
      <BikingSpeed
        bikeSpeed={settings.bikeSpeed}
        updateSettings={updateSettings}
      />
      {config.showBikeAndParkItineraries && (
        <SettingsToggle
          id="settings-toggle-bikeAndPark"
          labelId="park-and-ride"
          leftElement={<span style={{ width: '3em' }} />}
          toggled={settings.showBikeAndParkItineraries}
          onToggle={() => onToggle('showBikeAndParkItineraries', 'BikeAndPark')}
        />
      )}

      {config.includeCarSuggestions && (
        <SettingsToggle
          id="settings-toggle-car"
          labelId="car"
          labelStyle="mode-label"
          leftElement={
            <Icon color="#333" img="icon_car" width={2} height={2} />
          }
          toggled={settings.includeCarSuggestions}
          onToggle={() => onToggle('includeCarSuggestions', 'OwnCar')}
          borderStyle="top-border"
        />
      )}
      {config.includeParkAndRideSuggestions && (
        <SettingsToggle
          id="settings-toggle-parkAndRide"
          labelId="park-and-ride"
          leftElement={<span style={{ width: '3em' }} />}
          toggled={settings.includeParkAndRideSuggestions}
          onToggle={() =>
            onToggle('includeParkAndRideSuggestions', 'ParkAndRide')
          }
          borderStyle="top-border"
        />
      )}
    </div>
  );
}

StreetModeSelector.propTypes = {
  settings: settingsShape.isRequired,
  updateSettings: PropTypes.func.isRequired,
};
