import ceil from 'lodash/ceil';
import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';

import SelectOptionContainer, {
  getSpeedOptions,
  valueShape,
} from './SelectOptionContainer';
import { replaceQueryParams } from '../../util/queryUtils';
import { addAnalyticsEvent } from '../../util/analyticsUtils';

const WalkingOptionsSection = (
  { walkSpeed, defaultSettings },
  { router, match },
) => (
  <React.Fragment>
    <SelectOptionContainer
      currentSelection={walkSpeed}
      defaultValue={defaultSettings.walkSpeed}
      displayValueFormatter={value => `${ceil(value * 3.6, 1)} km/h`}
      onOptionSelected={value => {
        replaceQueryParams(router, match, { walkSpeed: value });
        addAnalyticsEvent({
          category: 'ItinerarySettings',
          action: 'ChangeWalkingSpeed',
          name: value,
        });
      }}
      options={getSpeedOptions(defaultSettings.walkSpeed, 3, 4)}
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
  walkSpeed: valueShape.isRequired,
};

WalkingOptionsSection.contextTypes = {
  router: routerShape.isRequired,
  match: matchShape.isRequired,
};

export default WalkingOptionsSection;
