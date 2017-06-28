import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Select from './Select';


class FareZoneSelector extends React.Component {

  static propTypes = {
    options: PropTypes.object.isRequired,
    currentOption: PropTypes.string.isRequired,
    headerText: PropTypes.string.isRequired,
    updateValue: PropTypes.func.isRequired,
  };

  createFareZoneObjects = (options) => {
    const optionsArray = Object.values(options);
    const constructedOptions = optionsArray.map((o) => {
      const obj = {};
      obj.displayName = <FormattedMessage defaultMessage={`ticket-type-${o}`} id={`ticket-type-${o}`} />;
      obj.value = o;
      return obj;
    });
    constructedOptions.push({
      displayName: <FormattedMessage defaultMessage="ticket-type-none" id="ticket-type-none" />,
      value: '0',
    });
    return constructedOptions;
  }

  render() {
    console.log(this.props.options);
    const mappedOptions = this.createFareZoneObjects(this.props.options);
    return (<section className="offcanvas-section">
      <Select
        headerText={this.props.headerText}
        name="ticket"
        selected={this.props.currentOption}
        options={mappedOptions}
        onSelectChange={e => this.props.updateValue(e.target.value)}
      />
    </section>);
  }
}

export default FareZoneSelector;
