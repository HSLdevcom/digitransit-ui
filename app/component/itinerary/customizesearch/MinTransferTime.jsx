import PropTypes from 'prop-types';
import React from 'react';
import { settingsShape, minTransferTimeShape } from '../../../util/shapes';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import SearchSettingsDropdown from './SearchSettingsDropdown';

export default function MinTransferTime({
  minTransferTimeOptions,
  settings,
  updateSettings,
}) {
  const options = minTransferTimeOptions;
  const currentSelection = options.find(
    option => option.value === settings.minTransferTime,
  );

  return (
    <SearchSettingsDropdown
      currentSelection={currentSelection}
      onOptionSelected={value => {
        updateSettings({
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
}

MinTransferTime.propTypes = {
  minTransferTimeOptions: minTransferTimeShape.isRequired,
  settings: settingsShape.isRequired,
  updateSettings: PropTypes.func.isRequired,
};
