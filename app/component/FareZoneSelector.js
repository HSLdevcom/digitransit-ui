import PropTypes from 'prop-types';
import React from 'react';
import uniqBy from 'lodash/uniqBy';
import { intlShape } from 'react-intl';
import Dropdown from './Dropdown';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { setCustomizedSettings } from '../store/localStorage';

class FareZoneSelector extends React.Component {
  static propTypes = {
    options: PropTypes.array.isRequired,
    currentOption: PropTypes.string.isRequired,
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { currentOption: props.currentOption };
  }

  createFareZoneObjects = options => {
    const { intl, config } = this.context;
    const constructedOptions = options.map(o => ({
      displayName: config.fareMapping(o),
      value: o,
    }));
    constructedOptions.push({
      displayName: 'none',
      displayNameObject: intl.formatMessage({
        defaultMessage: 'ticket-type-none',
        id: 'ticket-type-none',
      }),
      value: 'none',
    });
    return uniqBy(constructedOptions, 'value');
  };

  render() {
    const { options } = this.props;
    const { intl } = this.context;
    const mappedOptions = this.createFareZoneObjects(options);
    return (
      <div className="settings-option-container">
        <Dropdown
          labelText={intl.formatMessage({
            id: 'zones',
            defaultMessage: 'Fare zones',
          })}
          currentSelection={this.state.currentOption}
          options={mappedOptions}
          onOptionSelected={value => {
            setCustomizedSettings({ ticketTypes: value });
            addAnalyticsEvent({
              category: 'ItinerarySettings',
              action: 'ChangeFareZones',
              name: value,
            });
            this.setState({ currentOption: value });
          }}
          displayValueFormatter={value =>
            value.split(':')[1] ? value.split(':')[1] : value
          }
        />
      </div>
    );
  }
}

export default FareZoneSelector;
