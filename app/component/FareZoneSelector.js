import PropTypes from 'prop-types';
import React from 'react';
import uniqBy from 'lodash/uniqBy';
import { intlShape } from 'react-intl';
import Dropdown from './Dropdown';

class FareZoneSelector extends React.Component {
  static propTypes = {
    options: PropTypes.array.isRequired,
    currentOption: PropTypes.string.isRequired,
    updateValue: PropTypes.func.isRequired,
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
  };

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
    const mappedOptions = this.createFareZoneObjects(this.props.options);
    return (
      <div className="settings-option-container">
        <Dropdown
          labelText={this.context.intl.formatMessage({
            id: 'zones',
            defaultMessage: 'Fare zones',
          })}
          currentSelection={this.props.currentOption}
          options={mappedOptions}
          onOptionSelected={value => this.props.updateValue(value)}
          displayValueFormatter={value =>
            value.split(':')[1] ? value.split(':')[1] : value
          }
        />
      </div>
    );
  }
}

export default FareZoneSelector;
