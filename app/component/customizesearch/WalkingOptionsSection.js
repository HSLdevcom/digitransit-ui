import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { saveRoutingSettings } from '../../action/SearchSettingsActions';

import { addAnalyticsEvent } from '../../util/analyticsUtils';
import SearchSettingsDropdown, {
  getFiveStepOptions,
} from '../SearchSettingsDropdown';

const WalkingOptionsSection = (
  { currentSettings, defaultSettings, walkSpeedOptions },
  { intl, executeAction },
  options = getFiveStepOptions(walkSpeedOptions),
) => (
  <React.Fragment>
    <SearchSettingsDropdown
      currentSelection={options.find(
        option => option.value === currentSettings.walkSpeed,
      )}
      defaultValue={defaultSettings.walkSpeed}
      onOptionSelected={value => {
        executeAction(saveRoutingSettings, {
          walkSpeed: value,
        });
        addAnalyticsEvent({
          category: 'ItinerarySettings',
          action: 'ChangeWalkingSpeed',
          name: value,
        });
      }}
      options={options}
      labelText={intl.formatMessage({ id: 'walking-speed' })}
      highlightDefaulValue
      formatOptions
    />
  </React.Fragment>
);

WalkingOptionsSection.propTypes = {
  defaultSettings: PropTypes.shape({
    walkSpeed: PropTypes.number.isRequired,
  }).isRequired,
  walkSpeedOptions: PropTypes.array.isRequired,
  currentSettings: PropTypes.object.isRequired,
};

WalkingOptionsSection.contextTypes = {
  intl: intlShape.isRequired,
  executeAction: PropTypes.func.isRequired,
};

export default WalkingOptionsSection;
