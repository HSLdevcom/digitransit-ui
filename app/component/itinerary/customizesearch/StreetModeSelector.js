import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { settingsShape } from '../../../util/shapes';
import SettingsToggle from './SettingsToggle';
import Icon from '../../Icon';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import BikingSpeed from './BikingSpeed';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { useConfigContext } from '../../../configurations/ConfigContext';

export default function StreetModeSelector(
  { currentSettings },
  { executeAction },
) {
  const config = useConfigContext();
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
        toggled={!!currentSettings.includeBikeSuggestions}
        onToggle={() => onToggle('includeBikeSuggestions', 'OwnBike')}
        borderStyle="bottom-border"
      />
      <BikingSpeed bikeSpeed={currentSettings.bikeSpeed} />
      {config.showBikeAndParkItineraries && (
        <SettingsToggle
          id="settings-toggle-bikeAndPark"
          labelId="park-and-ride"
          leftElement={<span style={{ width: '3em' }} />}
          toggled={currentSettings.showBikeAndParkItineraries}
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
          toggled={currentSettings.includeCarSuggestions}
          onToggle={() => onToggle('includeCarSuggestions', 'OwnCar')}
          borderStyle="top-border"
        />
      )}
      {config.includeParkAndRideSuggestions && (
        <SettingsToggle
          id="settings-toggle-parkAndRide"
          labelId="park-and-ride"
          leftElement={<span style={{ width: '3em' }} />}
          toggled={currentSettings.includeParkAndRideSuggestions}
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
  currentSettings: settingsShape.isRequired,
};

StreetModeSelector.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};
