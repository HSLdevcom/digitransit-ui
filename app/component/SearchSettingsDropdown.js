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
    name: PropTypes.string.isRequired,
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
      this.labelRef.current.scrollIntoView({ block: 'nearest' });
    }
  }

  toggleDropdown = prevState => {
    this.setState({
      showDropdown: !prevState,
    });
  };

  handleDropdownClick = prevState => {
    this.toggleDropdown(prevState);
  };

  handleChangeOnly = value => {
    this.props.onOptionSelected(value);
  };

  getOptionTags = (dropdownOptions, prevState) => {
    return dropdownOptions.map(option => (
      <li key={option.displayName + option.value}>
        <label
          className={`settings-dropdown-choice ${
            option.value === this.props.currentSelection.value ? 'selected' : ''
          }`}
          htmlFor={`dropdown-${this.props.name}-${option.value}`}
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
          <input
            id={`dropdown-${this.props.name}-${option.value}`}
            type="radio"
            name={this.props.name}
            checked={option.value === this.props.currentSelection.value}
            value={option.value}
            onChange={e => {
              this.handleChangeOnly(option.value);
              // try to detect if event is from an actual click or keyboard navigation
              if (e.nativeEvent.clientX || e.nativeEvent.clientY) {
                this.handleDropdownClick(prevState);
              }
            }}
          />
        </label>
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
      ? options.map(o =>
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
      <fieldset className="settings-dropdown-wrapper" ref={this.labelRef}>
        <legend className="sr-only">{labelText}</legend>
        <button
          type="button"
          className="settings-dropdown-label"
          onClick={() => this.toggleDropdown(this.state.showDropdown)}
        >
          <p className="settings-dropdown-label-text" aria-hidden="true">
            {labelText}
          </p>
          <p className="settings-dropdown-label-value">
            {displayValueFormatter
              ? displayValueFormatter(currentSelection.title)
              : `${intl.formatMessage({
                  id: currentSelection.title,
                })}`}
          </p>
          <span className="sr-only">
            {intl.formatMessage({
              id: showDropdown
                ? 'settings-dropdown-close-label'
                : 'settings-dropdown-open-label',
            })}
          </span>
          <Icon
            className={
              this.state.showDropdown
                ? 'fake-select-arrow inverted'
                : 'fake-select-arrow'
            }
            img="icon-icon_arrow-dropdown"
          />
        </button>
        {showDropdown && (
          <ul role="radiogroup" className="settings-dropdown">
            {this.getOptionTags(selectOptions, this.state.showDropdown)}
          </ul>
        )}
      </fieldset>
    );
  }
}

export default SearchSettingsDropdown;
