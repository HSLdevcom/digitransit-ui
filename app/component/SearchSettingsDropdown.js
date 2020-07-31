/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import Icon from './Icon';

/**
 * Builds an array of options: least, less, default, more, most with preset
 * multipliers or given values for each option. Note: a higher value (relative to
 * the given value) means less/worse.
 *
 * @param {*} options The options to select from.
 */
export const getFiveStepOptions = options => [
  {
    title: 'option-least',
    value: options.least || options[0],
  },
  {
    title: 'option-less',
    value: options.less || options[1],
  },
  { title: 'option-default', value: options[2] },
  {
    title: 'option-more',
    value: options.more || options[3],
  },
  {
    title: 'option-most',
    value: options.most || options[4],
  },
];

/**
 * Represents the types of acceptable values.
 */
export const valueShape = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
]);

class SearchSettingsDropdown extends React.Component {
  static propTypes = {
    labelText: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired,
    displayValueFormatter: PropTypes.func,
    currentSelection: PropTypes.object.isRequired,
    highlightDefaultValue: PropTypes.bool,
    defaultValue: valueShape,
    displayPattern: PropTypes.string,
    onOptionSelected: PropTypes.func.isRequired,
    formatOptions: PropTypes.bool,
  };

  static defaultProps = {
    displayValueFormatter: undefined,
    highlightDefaultValue: false,
    displayPattern: undefined,
    defaultValue: undefined,
    formatOptions: false,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { showDropdown: false };
    this.labelRef = React.createRef();
  }

  componentDidUpdate() {
    if (this.state.showDropdown) {
      this.labelRef.current.scrollIntoView();
    }
  }

  toggleDropdown = prevState => {
    this.setState({
      showDropdown: !prevState,
    });
  };

  handleDropdownClick = (value, prevState) => {
    this.props.onOptionSelected(value);
    this.toggleDropdown(prevState);
  };

  getOptionTags = (dropdownOptions, prevState) => {
    return dropdownOptions.map(option => (
      <li
        className={
          option.value === this.props.currentSelection.value ? 'selected' : ''
        }
        key={option.displayName + option.value}
        value={option.value}
        onClick={() => this.handleDropdownClick(option.value, prevState)}
      >
        {option.displayNameObject
          ? option.displayNameObject
          : option.displayName}
        {option.value === this.props.currentSelection.value && (
          <Icon
            className="selected-checkmark"
            img="icon-icon_check"
            viewBox="0 0 15 11"
          />
        )}
      </li>
    ));
  };

  render() {
    const {
      labelText,
      currentSelection,
      options,
      displayValueFormatter,
      highlightDefaultValue,
      defaultValue,
      formatOptions,
    } = this.props;
    const { intl } = this.context;
    const { showDropdown } = this.state || {};

    function applyDefaultValueIdentifier(value, str) {
      return highlightDefaultValue && value === defaultValue
        ? `${intl.formatMessage({
            id: 'option-default',
          })} (${str})`
        : str;
    }

    function getFormattedValue(value) {
      return displayValueFormatter ? displayValueFormatter(value) : value;
    }
    const selectOptions = formatOptions
      ? options.map(
          o =>
            o.title && o.value
              ? {
                  displayName: `${o.title}_${o.value}`,
                  displayNameObject: applyDefaultValueIdentifier(
                    o.value,
                    this.context.intl.formatMessage(
                      { id: o.title },
                      {
                        title: o.title,
                      },
                    ),
                  ),
                  value: o.value,
                }
              : {
                  displayName: `${this.props.displayPattern}_${o}`,
                  displayNameObject: applyDefaultValueIdentifier(
                    o,
                    this.props.displayPattern
                      ? this.context.intl.formatMessage(
                          { id: this.props.displayPattern },
                          {
                            number: getFormattedValue(o),
                          },
                        )
                      : getFormattedValue(o),
                  ),
                  value: o,
                },
        )
      : options;

    return (
      <div className="settings-dropdown-wrapper">
        <span
          className="settings-dropdown-label"
          onClick={() => this.toggleDropdown(this.state.showDropdown)}
          role="Button"
          tabIndex="0"
          ref={this.labelRef}
        >
          <p className="settings-dropdown-label-text">{labelText}</p>
          <p className="settings-dropdown-label-value">
            {displayValueFormatter
              ? displayValueFormatter(currentSelection.title)
              : `${intl.formatMessage({
                  id: currentSelection.title,
                })}`}
          </p>
          <Icon
            className={
              this.state.showDropdown
                ? 'fake-select-arrow inverted'
                : 'fake-select-arrow'
            }
            img="icon-icon_arrow-dropdown"
          />
        </span>
        {showDropdown && (
          <ul className="settings-dropdown">
            {this.getOptionTags(selectOptions, this.state.showDropdown)}
          </ul>
        )}
      </div>
    );
  }
}

export default SearchSettingsDropdown;
