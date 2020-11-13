import PropTypes from 'prop-types';
import React from 'react';
import { matchShape } from 'found';
import { intlShape } from 'react-intl';
import { saveRoutingSettings } from '../../action/SearchSettingsActions';

import SearchSettingsDropdown, {
  getFiveStepOptionsNumerical,
  valueShape,
} from '../SearchSettingsDropdown';
import { addAnalyticsEvent } from '../../util/analyticsUtils';
import { findNearestOption } from '../../util/planParamUtil';

// eslint-disable-next-line react/prefer-stateless-function
class BikingOptionsSection extends React.Component {
  render() {
    const { defaultSettings, bikeSpeed } = this.props;
    const { intl } = this.context;
    const options = getFiveStepOptionsNumerical(this.props.bikeSpeedOptions);
    const currentSelection =
      options.find(option => option.value === bikeSpeed) ||
      options.find(
        option =>
          option.value ===
          findNearestOption(bikeSpeed, this.props.bikeSpeedOptions),
      );
    return (
      <React.Fragment>
        <SearchSettingsDropdown
          name="bike-speed-selector"
          currentSelection={currentSelection}
          defaultValue={defaultSettings.bikeSpeed}
          onOptionSelected={value => {
            this.context.executeAction(saveRoutingSettings, {
              bikeSpeed: value,
            });
            addAnalyticsEvent({
              category: 'ItinerarySettings',
              action: 'ChangeBikingSpeed',
              name: value,
            });
          }}
          options={options}
          formatOptions
          labelText={intl.formatMessage({ id: 'biking-speed' })}
          translateLabels={false}
        />
      </React.Fragment>
    );
  }
}

BikingOptionsSection.propTypes = {
  bikeSpeed: valueShape.isRequired,
  bikeSpeedOptions: PropTypes.array.isRequired,
  defaultSettings: PropTypes.shape({
    bikeSpeed: PropTypes.number.isRequired,
  }).isRequired,
};

BikingOptionsSection.contextTypes = {
  match: matchShape.isRequired,
  intl: intlShape.isRequired,
  executeAction: PropTypes.func.isRequired,
};

export default BikingOptionsSection;
