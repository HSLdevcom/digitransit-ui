import PropTypes from 'prop-types';
import React from 'react';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import SearchSettingsDropdown from './SearchSettingsDropdown';
import SettingsToggle from './SettingsToggle';
import { findNearestOption } from '../../../util/planParamUtil';
import { settingsShape } from '../../../util/shapes';
import { useConfigContext } from '../../../configurations/ConfigContext';
import { useTranslationsContext } from '../../../util/useTranslationsContext';

const roundToOneDecimal = number => {
  const rounded = Math.round(number * 10) / 10;
  return rounded.toFixed(1).replace('.', ',');
};

const title = [
  'option-least',
  'option-less',
  'option-default',
  'option-more',
  'option-most',
];

export default function WalkingOptions({ currentSettings }, { executeAction }) {
  const { defaultOptions, defaultSettings } = useConfigContext();
  const intl = useTranslationsContext();

  const options = defaultOptions.walkSpeed.map((s, i) => ({
    title: intl.formatMessage({ id: title[i] }),
    value: s,
    kmhValue: `${roundToOneDecimal(s * 3.6)} km/h`,
  }));

  const currentWalkSelection =
    options.find(option => option.value === currentSettings.walkSpeed) ||
    options.find(
      option =>
        option.value ===
        findNearestOption(currentSettings.walkSpeed, defaultOptions.walkSpeed),
    );
  const onToggle = () => {
    const newValue =
      currentSettings.walkReluctance !== defaultOptions.highWalkReluctance
        ? defaultOptions.highWalkReluctance
        : defaultSettings.walkReluctance;
    executeAction(saveRoutingSettings, { walkReluctance: newValue });
    addAnalyticsEvent({
      category: 'ItinerarySettings',
      action: 'ChangeAmountOfWalking',
      name:
        newValue === defaultOptions.highWalkReluctance ? 'avoid' : 'default',
    });
  };

  return (
    <>
      <SearchSettingsDropdown
        currentSelection={currentWalkSelection}
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
        labelId="walking-speed"
        name="walkspeed"
      />
      <SettingsToggle
        id="settings-toggle-avoid-walking"
        labelId="avoid-walking"
        toggled={
          currentSettings.walkReluctance === defaultOptions.highWalkReluctance
        }
        onToggle={onToggle}
        borderStyle="top-border"
      />
    </>
  );
}

WalkingOptions.propTypes = {
  currentSettings: settingsShape.isRequired,
};

WalkingOptions.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};
