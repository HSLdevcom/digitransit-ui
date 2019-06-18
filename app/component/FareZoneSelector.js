import PropTypes from 'prop-types';
import React from 'react';
import uniqBy from 'lodash/uniqBy';
import { intlShape } from 'react-intl';
import Icon from './Icon';
import Select from './Select';

class FareZoneSelector extends React.Component {
  static propTypes = {
    options: PropTypes.array.isRequired,
    currentOption: PropTypes.string.isRequired,
    headerText: PropTypes.string.isRequired,
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
      <div className="settings-option-container ticket-options-container">
        <div className="option-container">
          <h1>{this.props.headerText}</h1>
          <div className="select-container">
            <Select
              name="ticket"
              selected={this.props.currentOption}
              options={mappedOptions}
              onSelectChange={e => this.props.updateValue(e.target.value)}
            />
            <Icon
              className="fake-select-arrow"
              img="icon-icon_arrow-dropdown"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default FareZoneSelector;
