import PropTypes from 'prop-types';
import React from 'react';

class Select extends React.Component {
  static propTypes = {
    onSelectChange: PropTypes.func.isRequired,
    headerText: PropTypes.string,
    selected: PropTypes.string,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        displayName: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
      }).isRequired,
    ).isRequired,
  };

  static getOptionTags(options) {
    return options.map(option => (
      <option key={option.displayName + option.value} value={option.value}>
        {option.displayName}
      </option>
    ));
  }

  render() {
    return (
      <div>
        <h4>{this.props.headerText}</h4>
        <select
          onChange={this.props.onSelectChange}
          value={this.props.selected}
        >
          {Select.getOptionTags(this.props.options)}
        </select>
      </div>
    );
  }
}

export default Select;
