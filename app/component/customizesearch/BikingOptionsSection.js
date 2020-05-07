import ceil from 'lodash/ceil';
import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import { intlShape } from 'react-intl';

import Dropdown, { getFiveStepOptions, valueShape } from '../Dropdown';
import { replaceQueryParams } from '../../util/queryUtils';
import { addAnalyticsEvent } from '../../util/analyticsUtils';

const BikingOptionsSection = (
  { bikeSpeed, defaultSettings, bikeSpeedOptions },
  { router, match, intl },
) => (
  <React.Fragment>
    {/* OTP uses the same walkReluctance setting for bike routing */}
    <Dropdown
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
      options={getFiveStepOptions(bikeSpeedOptions)}
      formatOptions
      labelText={intl.formatMessage({ id: 'biking-speed' })}
    />
  </React.Fragment>
);

BikingOptionsSection.propTypes = {
  bikeSpeed: valueShape.isRequired,
  bikeSpeedOptions: PropTypes.array.isRequired,
  defaultSettings: PropTypes.shape({
    walkReluctance: PropTypes.number.isRequired,
    bikeSpeed: PropTypes.number.isRequired,
  }).isRequired,
};

BikingOptionsSection.contextTypes = {
  router: routerShape.isRequired,
  match: matchShape.isRequired,
  intl: intlShape.isRequired,
};

export default BikingOptionsSection;
