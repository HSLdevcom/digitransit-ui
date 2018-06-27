import PropTypes from 'prop-types';
import React from 'react';
import uniqBy from 'lodash/uniqBy';
import { intlShape, FormattedMessage } from 'react-intl';
import Icon from './Icon';
import Select from './Select';

class FareZoneSelector extends React.Component {
  static propTypes = {
    options: PropTypes.object.isRequired,
    currentOption: PropTypes.string.isRequired,
    headerText: PropTypes.string.isRequired,
    updateValue: PropTypes.func.isRequired,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  createFareZoneObjects = options => {
    const optionsArray = Object.values(options);
    const constructedOptions = optionsArray.map(o => {
      const obj = {};
      obj.displayName = o.replace(':', '_');
      obj.displayNameObject = (
        <FormattedMessage
          defaultMessage={`ticket-type-${o}`}
          id={`ticket-type-${o}`}
        />
      );
      obj.value = o.replace(':', '_');
      return obj;
    });
    constructedOptions.push({
      displayName: 'none',
      displayNameObject: (
        <FormattedMessage
          defaultMessage="ticket-type-none"
          id="ticket-type-none"
        />
      ),
      value: 'none',
    });
    return uniqBy(constructedOptions, 'value');
  };

  render() {
    const mappedOptions = this.createFareZoneObjects(this.props.options);
    return (
      <div className="option-container">
        <h1>{this.props.headerText}</h1>
        <div className="select-container">
          <Select
            name="ticket"
            selected={this.props.currentOption}
            options={mappedOptions}
            onSelectChange={e => this.props.updateValue(e.target.value)}
          />
          <Icon className="fake-select-arrow" img="icon-icon_arrow-dropdown" />
        </div>
      </div>
    );
  }
}

export default FareZoneSelector;
