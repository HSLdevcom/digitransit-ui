import ceil from 'lodash/ceil';
import PropTypes from 'prop-types';
import React from 'react';
import { matchShape } from 'found';
import { intlShape } from 'react-intl';

import Dropdown, { getFiveStepOptions, valueShape } from '../Dropdown';
import { addAnalyticsEvent } from '../../util/analyticsUtils';
import { setCustomizedSettings } from '../../store/localStorage';

class BikingOptionsSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = { bikeSpeed: props.bikeSpeed };
  }

  render() {
    const { defaultSettings, bikeSpeedOptions } = this.props;
    const { intl } = this.context;
    return (
      <React.Fragment>
        {/* OTP uses the same walkReluctance setting for bike routing */}
        <Dropdown
          currentSelection={this.state.bikeSpeed}
          defaultValue={defaultSettings.bikeSpeed}
          displayValueFormatter={value => `${ceil(value * 3.6, 1)} km/h`}
          onOptionSelected={value => {
            setCustomizedSettings({ bikeSpeed: value });
            addAnalyticsEvent({
              category: 'ItinerarySettings',
              action: 'ChangeBikingSpeed',
              name: value,
            });
            this.setState({ bikeSpeed: value });
          }}
          options={getFiveStepOptions(bikeSpeedOptions)}
          formatOptions
          labelText={intl.formatMessage({ id: 'biking-speed' })}
        />
      </React.Fragment>
    );
  }
}

BikingOptionsSection.propTypes = {
  bikeSpeed: valueShape.isRequired,
  bikeSpeedOptions: PropTypes.array.isRequired,
  defaultSettings: PropTypes.shape({
    walkReluctance: PropTypes.number.isRequired,
    bikeSpeed: PropTypes.number.isRequired,
  }).isRequired,
};

BikingOptionsSection.contextTypes = {
  match: matchShape.isRequired,
  intl: intlShape.isRequired,
};

export default BikingOptionsSection;
