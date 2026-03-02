import PropTypes from 'prop-types';
import React from 'react';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import { settingsShape, minTransferTimeShape } from '../../../util/shapes';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import SearchSettingsDropdown from './SearchSettingsDropdown';

const MinTransferTime = (
  { currentSettings, minTransferTimeOptions },
  { executeAction },
  options = minTransferTimeOptions,
  currentSelection = options.find(
    option => option.value === currentSettings.minTransferTime,
  ),
) => (
  <SearchSettingsDropdown
    currentSelection={currentSelection}
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
    labelId="min-transfer-time"
    name="minTransferTime"
    translateLabels={false}
  />
);

MinTransferTime.propTypes = {
  minTransferTimeOptions: minTransferTimeShape.isRequired,
  currentSettings: settingsShape.isRequired,
};

MinTransferTime.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};

export default MinTransferTime;
