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
    this.state = {
      bikeSpeed: props.bikeSpeed,
      options: getFiveStepOptions(props.bikeSpeedOptions),
    };
  }

  render() {
    const { defaultSettings } = this.props;
    const { intl } = this.context;
    return (
      <React.Fragment>
        {/* OTP uses the same walkReluctance setting for bike routing */}
        <Dropdown
          currentSelection={this.state.options.find(
            option => option.value === this.state.bikeSpeed,
          )}
          defaultValue={defaultSettings.bikeSpeed}
          onOptionSelected={value => {
            setCustomizedSettings({ bikeSpeed: value });
            addAnalyticsEvent({
              category: 'ItinerarySettings',
              action: 'ChangeBikingSpeed',
              name: value,
            });
            this.setState({ bikeSpeed: value });
          }}
          options={this.state.options}
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
