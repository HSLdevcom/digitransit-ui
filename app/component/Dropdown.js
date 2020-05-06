/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import Icon from './Icon';

/**
 * Builds an array of options starting from the minimum value, including default value
 * and having a total of stepCount steps with a size of stepSize.
 *
 * @param {number} defaultValue The default value.
 * @param {number} minValue The minimum value.
 * @param {number} stepSize The size of the step.
 * @param {number} stepCount The total count of steps.
 */
export const getLinearStepOptions = (
  defaultValue,
  minValue,
  stepSize,
  stepCount,
) => {
  const options = [defaultValue];
  for (let i = 0; i < stepCount; ++i) {
    const currentValue = minValue + i * stepSize;
    if (Math.abs(currentValue - defaultValue) > 0.01) {
      options.push(currentValue);
    }
  }
  return options;
};

/**
 * Builds an array of options starting from the minimum value, including default value
 * and having a total of stepCount steps.
 *
 * @param {number} defaultValue The default value (in m/s).
 * @param {number} minValue The minimum value (in km/h).
 * @param {number} stepCount The total count of steps.
 */
export const getSpeedOptions = (defaultValue, minValue, stepCount) => {
  const KPH = 0.2777; // an approximation of 1 / 3.6 which is 1 km/h in m/s
  return getLinearStepOptions(defaultValue, minValue * KPH, KPH, stepCount);
};

/**
 * Represents the types of acceptable values.
 */
export const valueShape = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
]);

class Dropdown extends React.Component {
  static propTypes = {
    labelText: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired,
    displayValueFormatter: PropTypes.func,
    currentSelection: valueShape.isRequired,
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
          option.value === this.props.currentSelection ? 'selected' : ''
        }
        key={option.displayName + option.value}
        value={option.value}
        onClick={() => this.handleDropdownClick(option.value, prevState)}
      >
        {option.displayNameObject
          ? option.displayNameObject
          : option.displayName}
        {option.value === this.props.currentSelection && (
          <h4 className="selected-checkmark">&#10003;</h4>
          /* <Icon
            className="selected-checkmark"
            img="icon-icon_arrow-dropdown"
          /> */
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
        : `${str}`;
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
                    this.contenxt.intl.formatMessage(
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
      <div className="dropdown-wrapper">
        <span
          className="dropdown-label"
          onClick={() => this.toggleDropdown(this.state.showDropdown)}
          role="Button"
          tabIndex="0"
        >
          <h4 className="dropdown-label-text">
            <FormattedMessage
              id="dropdown-label-text"
              defaultMessage={labelText}
            />
          </h4>
          <h4 className="dropdown-label-value">
            {displayValueFormatter
              ? displayValueFormatter(currentSelection)
              : currentSelection}
          </h4>
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
          <ul className="dropdown">
            {this.getOptionTags(selectOptions, this.state.showDropdown)}
          </ul>
        )}
      </div>
    );
  }
}

export default Dropdown;
