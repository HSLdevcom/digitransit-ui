import PropTypes from 'prop-types';
import React from 'react';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import SearchSettingsDropdown, { valueShape } from './SearchSettingsDropdown';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { findNearestOption } from '../../../util/planParamUtil';
import { useConfigContext } from '../../../configurations/ConfigContext';

export default function BikingSpeed({ bikeSpeed }, { executeAction }) {
  const config = useConfigContext();

  const options = config.defaultOptions.bikeSpeed.map(item => ({
    title: `${Math.round(item * 3.6)} km/h`,
    value: item,
  }));

  const currentSelection =
    options.find(option => option.value === bikeSpeed) ||
    options.find(
      option =>
        option.value ===
        findNearestOption(bikeSpeed, config.defaultOptions.bikeSpeed),
    );

  return (
    <SearchSettingsDropdown
      name="bike-speed-selector"
      currentSelection={currentSelection}
      onOptionSelected={value => {
        executeAction(saveRoutingSettings, {
          bikeSpeed: value,
        });
        addAnalyticsEvent({
          category: 'ItinerarySettings',
          action: 'ChangeBikingSpeed',
          name: value,
        });
      }}
      options={options}
      labelId="biking-speed"
      translateLabels={false}
    />
  );
}

BikingSpeed.propTypes = { bikeSpeed: valueShape.isRequired };
BikingSpeed.contextTypes = { executeAction: PropTypes.func.isRequired };
