import ceil from 'lodash/ceil';
import PropTypes from 'prop-types';
import React from 'react';
import { routerShape } from 'react-router';

import SelectOptionContainer, {
  getFiveStepOptions,
  getSpeedOptions,
  optionsShape,
  valueShape,
} from './SelectOptionContainer';
import { replaceQueryParams } from '../../util/queryUtils';
import { addAnalyticsEvent } from '../../util/analyticsUtils';

const WalkingOptionsSection = (
  { walkReluctance, walkReluctanceOptions, walkSpeed, defaultSettings },
  { router },
) => (
  <React.Fragment>
    <SelectOptionContainer
      currentSelection={walkReluctance}
      defaultValue={defaultSettings.walkReluctance}
      highlightDefaultValue={false}
      onOptionSelected={value => {
        replaceQueryParams(router, { walkReluctance: value });
        addAnalyticsEvent({
          category: 'ItinerarySettings',
          action: 'ChangeAmountOfWalking',
          name: value,
        });
      }}
      options={getFiveStepOptions(
        defaultSettings.walkReluctance,
        walkReluctanceOptions,
      )}
      title="walking"
    />
    <SelectOptionContainer
      currentSelection={walkSpeed}
      defaultValue={defaultSettings.walkSpeed}
      displayValueFormatter={value => `${ceil(value * 3.6, 1)} km/h`}
      onOptionSelected={value => {
        replaceQueryParams(router, { walkSpeed: value });
        addAnalyticsEvent({
          category: 'ItinerarySettings',
          action: 'ChangeWalkingSpeed',
          name: value,
        });
      }}
      options={getSpeedOptions(defaultSettings.walkSpeed, 1, 12)}
      sortByValue
      title="walking-speed"
    />
  </React.Fragment>
);

WalkingOptionsSection.propTypes = {
  defaultSettings: PropTypes.shape({
    walkReluctance: PropTypes.number.isRequired,
    walkSpeed: PropTypes.number.isRequired,
  }).isRequired,
  walkReluctance: valueShape.isRequired,
  walkReluctanceOptions: optionsShape.isRequired,
  walkSpeed: valueShape.isRequired,
};

WalkingOptionsSection.contextTypes = {
  router: routerShape.isRequired,
};

export default WalkingOptionsSection;
