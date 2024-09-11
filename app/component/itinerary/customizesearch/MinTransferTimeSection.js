import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import { settingsShape, minTransferTimeShape } from '../../../util/shapes';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import SearchSettingsDropdown from './SearchSettingsDropdown';

const MinTransferTimeSection = (
  { currentSettings, defaultSettings, minTransferTimeOptions },
  { intl, executeAction },
  options = minTransferTimeOptions,
  currentSelection = options.find(
    option => option.value === currentSettings.minTransferTime,
  ),
) => (
  <div className="walk-options-container">
    <SearchSettingsDropdown
      currentSelection={currentSelection}
      defaultValue={defaultSettings.minTransferTime}
      onOptionSelected={value => {
        executeAction(saveRoutingSettings, {
          minTransferTime: value,
        });
        addAnalyticsEvent({
          category: 'ItinerarySettings',
          action: 'ChangeMinTransferTime',
          name: value,
        });
      }}
      options={options}
      labelText={intl.formatMessage({ id: 'min-transfer-time' })}
      highlightDefaulValue
      formatOptions
      name="minTransferTime"
      translateLabels={false}
    />
  </div>
);

MinTransferTimeSection.propTypes = {
  defaultSettings: settingsShape.isRequired,
  minTransferTimeOptions: minTransferTimeShape.isRequired,
  currentSettings: settingsShape.isRequired,
};

MinTransferTimeSection.contextTypes = {
  intl: intlShape.isRequired,
  executeAction: PropTypes.func.isRequired,
};

export default MinTransferTimeSection;
