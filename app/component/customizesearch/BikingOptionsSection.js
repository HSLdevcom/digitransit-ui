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

const BikingOptionsSection = (
  { bikeSpeed, defaultSettings },
  { router, match },
) => (
  <React.Fragment>
    {/* OTP uses the same walkReluctance setting for bike routing */}
    <SelectOptionContainer
      currentSelection={bikeSpeed}
      defaultValue={defaultSettings.bikeSpeed}
      displayValueFormatter={value => `${ceil(value * 3.6, 1)} km/h`}
      onOptionSelected={value => {
        replaceQueryParams(router, match, { bikeSpeed: value });
        addAnalyticsEvent({
          category: 'ItinerarySettings',
          action: 'ChangeBikingSpeed',
          name: value,
        });
      }}
      options={getSpeedOptions(defaultSettings.bikeSpeed, 16, 5)}
      sortByValue
      title="biking-speed"
    />
  </React.Fragment>
);

BikingOptionsSection.propTypes = {
  bikeSpeed: valueShape.isRequired,
  defaultSettings: PropTypes.shape({
    walkReluctance: PropTypes.number.isRequired,
    bikeSpeed: PropTypes.number.isRequired,
  }).isRequired,
};

BikingOptionsSection.contextTypes = {
  router: routerShape.isRequired,
  match: matchShape.isRequired,
};

export default BikingOptionsSection;
