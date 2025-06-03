import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Toggle from '../../Toggle';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { settingsShape } from '../../../util/shapes';
import Icon from '../../Icon';

const TaxiOptionsSection = (
  { defaultSettings, currentSettings },
  { executeAction },
) => {
  const taxiRouting =
    currentSettings.includeTaxiSuggestions ||
    defaultSettings.includeTaxiSuggestions;
  const taxiRoutingState = taxiRouting ? 'Disable' : 'Enable';
  return (
    <div className="mode-option-container">
      <div className="settings-header">
        <FormattedMessage
          id="taxis-and-ride-hailing"
          defaultMessage="Taxis and ride-hailing"
        />
      </div>
      <div className="mode-option-container">
        <div className="mode-option-block">
          <div className="mode-icon">
            <Icon
              className="taxi-icon"
              img="icon-icon_taxi-external"
              viewBox="0 0 32 32"
            />
          </div>
          <label htmlFor="settings-toggle-taxis" className="mode-name">
            <FormattedMessage
              className="mode-name"
              id="taxis-and-ride-hailing"
              defaultMessage="Taxis and ride-hailing"
            />
            <Toggle
              id="settings-toggle-taxis"
              toggled={taxiRouting}
              onToggle={() => {
                executeAction(saveRoutingSettings, {
                  includeTaxiSuggestions: !taxiRouting,
                });
                addAnalyticsEvent({
                  category: 'ItinerarySettings',
                  action: `Settings${taxiRoutingState}Taxis`,
                  name: 'includeTaxiSuggestions',
                });
              }}
              title="taxis"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

TaxiOptionsSection.propTypes = {
  defaultSettings: settingsShape.isRequired,
  currentSettings: settingsShape.isRequired,
};

TaxiOptionsSection.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};

export default TaxiOptionsSection;
