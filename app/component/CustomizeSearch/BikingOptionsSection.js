import ceil from 'lodash/ceil';
import PropTypes from 'prop-types';
import React from 'react';
import { routerShape } from 'react-router';

import SelectOptionContainer, {
  getFiveStepOptions,
  getSpeedOptions,
} from './SelectOptionContainer';
import { defaultSettings } from '../../util/planParamUtil';
import { replaceQueryParams } from '../../util/queryUtils';

const BikingOptionsSection = ({ walkReluctance, bikeSpeed }, { router }) => (
  <React.Fragment>
    {/* OTP uses the same walkReluctance setting for bike routing */}
    <SelectOptionContainer
      currentSelection={walkReluctance}
      defaultValue={defaultSettings.walkReluctance}
      highlightDefaultValue={false}
      onOptionSelected={value =>
        replaceQueryParams(router, { walkReluctance: value })
      }
      options={getFiveStepOptions(defaultSettings.walkReluctance, true)}
      title="biking-amount"
    />
    <SelectOptionContainer
      currentSelection={bikeSpeed}
      defaultValue={defaultSettings.bikeSpeed}
      displayPattern="kilometers-per-hour"
      displayValueFormatter={value => ceil(value * 3.6, 1)}
      onOptionSelected={value =>
        replaceQueryParams(router, { bikeSpeed: value })
      }
      options={getSpeedOptions(defaultSettings.bikeSpeed, 10, 21)}
      sortByValue
      title="biking-speed"
    />
  </React.Fragment>
);

BikingOptionsSection.propTypes = {
  walkReluctance: PropTypes.number.isRequired,
  bikeSpeed: PropTypes.number.isRequired,
};

BikingOptionsSection.contextTypes = {
  router: routerShape.isRequired,
};

export default BikingOptionsSection;
