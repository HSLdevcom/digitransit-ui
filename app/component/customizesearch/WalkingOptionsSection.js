import ceil from 'lodash/ceil';
import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import { intlShape } from 'react-intl';

import { replaceQueryParams } from '../../util/queryUtils';
import { addAnalyticsEvent } from '../../util/analyticsUtils';
import Dropdown, { getFiveStepOptions, valueShape } from '../Dropdown';

const WalkingOptionsSection = (
  { walkSpeed, defaultSettings, walkSpeedOptions },
  { router, match, intl },
) => (
  <React.Fragment>
    <Dropdown
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
      options={getFiveStepOptions(walkSpeedOptions)}
      labelText={intl.formatMessage({ id: 'walking-speed' })}
      highlightDefaulValue
      formatOptions
    />
  </React.Fragment>
);

WalkingOptionsSection.propTypes = {
  defaultSettings: PropTypes.shape({
    walkReluctance: PropTypes.number.isRequired,
    walkSpeed: PropTypes.number.isRequired,
  }).isRequired,
  walkSpeedOptions: PropTypes.array.isRequired,
  walkSpeed: valueShape.isRequired,
};

WalkingOptionsSection.contextTypes = {
  router: routerShape.isRequired,
  match: matchShape.isRequired,
  intl: intlShape.isRequired,
};

export default WalkingOptionsSection;
