import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import SearchSettingsDropdown, {
  getFiveStepOptions,
} from './SearchSettingsDropdown';
import Toggle from '../../Toggle';
import { findNearestOption } from '../../../util/planParamUtil';
import { settingsShape } from '../../../util/shapes';

const WalkingOptionsSection = (
  { currentSettings, defaultSettings, walkSpeedOptions, walkReluctanceOptions },
  { intl, executeAction },
  options = getFiveStepOptions(walkSpeedOptions),
  currentSelection = options.find(
    option => option.value === currentSettings.walkSpeed,
  ) ||
    options.find(
      option =>
        option.value ===
        findNearestOption(currentSettings.walkSpeed, walkSpeedOptions),
    ),
) => (
  <div className="walk-options-container">
    <SearchSettingsDropdown
      currentSelection={currentSelection}
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
      name="walkspeed"
    />
    <div className="toggle-container walk-option-inner">
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label
        htmlFor="settings-toggle-avoid-walking"
        className="settings-header toggle-label"
      >
        <div className="toggle-label-text">
          {intl.formatMessage({ id: 'avoid-walking' })}
        </div>
        <Toggle
          id="settings-toggle-avoid-walking"
          toggled={
            currentSettings.walkReluctance === walkReluctanceOptions.least
          }
          onToggle={() => {
            const avoid =
              currentSettings.walkReluctance !== walkReluctanceOptions.least;
            executeAction(saveRoutingSettings, {
              walkReluctance: avoid
                ? walkReluctanceOptions.least
                : defaultSettings.walkReluctance,
            });
            addAnalyticsEvent({
              category: 'ItinerarySettings',
              action: 'ChangeAmountOfWalking',
              name: avoid ? 'avoid' : 'default',
            });
          }}
        />
      </label>
    </div>
  </div>
);

WalkingOptionsSection.propTypes = {
  defaultSettings: settingsShape.isRequired,
  walkSpeedOptions: PropTypes.arrayOf(PropTypes.number).isRequired,
  currentSettings: settingsShape.isRequired,
  walkReluctanceOptions: PropTypes.shape({ least: PropTypes.number.isRequired })
    .isRequired,
};

WalkingOptionsSection.contextTypes = {
  intl: intlShape.isRequired,
  executeAction: PropTypes.func.isRequired,
};

export default WalkingOptionsSection;
