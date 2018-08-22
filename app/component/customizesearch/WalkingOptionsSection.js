import ceil from 'lodash/ceil';
import PropTypes from 'prop-types';
import React from 'react';
import { routerShape } from 'react-router';

import SelectOptionContainer, {
  getFiveStepOptions,
  getSpeedOptions,
  valueShape,
} from './SelectOptionContainer';
import { replaceQueryParams } from '../../util/queryUtils';

const WalkingOptionsSection = (
  { walkReluctance, walkSpeed, defaultSettings },
  { router },
) => (
  <React.Fragment>
    <SelectOptionContainer
      currentSelection={walkReluctance}
      defaultValue={defaultSettings.walkReluctance}
      highlightDefaultValue={false}
      onOptionSelected={value =>
        replaceQueryParams(router, { walkReluctance: value })
      }
      options={getFiveStepOptions(defaultSettings.walkReluctance, true)}
      title="walking"
    />
    <SelectOptionContainer
      currentSelection={walkSpeed}
      defaultValue={defaultSettings.walkSpeed}
      displayValueFormatter={value => `${ceil(value * 3.6, 1)} km/h`}
      onOptionSelected={value =>
        replaceQueryParams(router, { walkSpeed: value })
      }
      options={getSpeedOptions(defaultSettings.walkSpeed, 1, 12)}
      sortByValue
      title="walking-speed"
    />
  </React.Fragment>
);

WalkingOptionsSection.propTypes = {
  walkReluctance: valueShape.isRequired,
  walkSpeed: valueShape.isRequired,
  defaultSettings: PropTypes.shape({
    walkReluctance: PropTypes.number.isRequired,
    walkSpeed: PropTypes.number.isRequired,
  }).isRequired,
};

WalkingOptionsSection.contextTypes = {
  router: routerShape.isRequired,
};

export default WalkingOptionsSection;
