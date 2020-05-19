import ceil from 'lodash/ceil';
import PropTypes from 'prop-types';
import React from 'react';
import { matchShape } from 'found';
import { intlShape } from 'react-intl';
import { setCustomizedSettings } from '../../store/localStorage';

import { addAnalyticsEvent } from '../../util/analyticsUtils';
import Dropdown, { getFiveStepOptions } from '../Dropdown';

class WalkingOptionsSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = { currentSettings: props.currentSettings };
  }

  render() {
    return (
      <React.Fragment>
        <Dropdown
          currentSelection={
            this.state.currentSettings.walkSpeed
              ? this.state.currentSettings.walkSpeed
              : this.props.defaultSettings.walkSpeed
          }
          defaultValue={this.props.defaultSettings.walkSpeed}
          displayValueFormatter={value => `${ceil(value * 3.6, 1)} km/h`}
          onOptionSelected={value => {
            this.setState(
              { currentSettings: { walkSpeed: value } },
              setCustomizedSettings({ walkSpeed: value }),
            );
            addAnalyticsEvent({
              category: 'ItinerarySettings',
              action: 'ChangeWalkingSpeed',
              name: value,
            });
          }}
          options={getFiveStepOptions(this.props.walkSpeedOptions)}
          labelText={this.context.intl.formatMessage({ id: 'walking-speed' })}
          highlightDefaulValue
          formatOptions
        />
      </React.Fragment>
    );
  }
}

WalkingOptionsSection.propTypes = {
  defaultSettings: PropTypes.shape({
    walkReluctance: PropTypes.number.isRequired,
    walkSpeed: PropTypes.number.isRequired,
  }).isRequired,
  walkSpeedOptions: PropTypes.array.isRequired,
  currentSettings: PropTypes.object.isRequired,
};

WalkingOptionsSection.contextTypes = {
  match: matchShape.isRequired,
  intl: intlShape.isRequired,
};

export default WalkingOptionsSection;
