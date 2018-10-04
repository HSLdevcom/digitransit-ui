import uniqBy from 'lodash/uniqBy';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import Icon from '../Icon';
import Select from '../Select';

/**
 * Represents the type of options configuration.
 */
export const optionsShape = PropTypes.shape({
  least: PropTypes.number.isRequired,
  less: PropTypes.number.isRequired,
  more: PropTypes.number.isRequired,
  most: PropTypes.number.isRequired,
});

/**
 * Builds an array of options: least, less, default, more, most with preset
 * multipliers or given values for each option. Note: a higher value (relative to
 * the given value) means less/worse.
 *
 * @param {number} defaultValue The default value.
 * @param {*} options The options to select from.
 */
export const getFiveStepOptions = (defaultValue, options) => [
  {
    title: 'option-least',
    value: options.least || options[0],
  },
  {
    title: 'option-less',
    value: options.less || options[1],
  },
  { title: 'option-default', value: defaultValue },
  {
    title: 'option-more',
    value: options.more || options[2],
  },
  {
    title: 'option-most',
    value: options.most || options[3],
  },
];

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

const SelectOptionContainer = (
  {
    currentSelection,
    defaultValue,
    displayPattern,
    displayValueFormatter,
    highlightDefaultValue,
    options,
    onOptionSelected,
    sortByValue,
    title,
  },
  { intl },
) => {
  const applyDefaultValueIdentifier = (value, str) =>
    highlightDefaultValue && value === defaultValue
      ? `${intl.formatMessage({ id: 'option-default' })} (${str})`
      : `${str}`;
  const getFormattedValue = value =>
    displayValueFormatter ? displayValueFormatter(value) : value;

  const selectOptions = options.map(
    o =>
      o.title && o.value
        ? {
            displayName: `${o.title}_${o.value}`,
            displayNameObject: applyDefaultValueIdentifier(
              o.value,
              intl.formatMessage(
                { id: o.title },
                {
                  title: o.title,
                },
              ),
            ),
            value: o.value,
          }
        : {
            displayName: `${displayPattern}_${o}`,
            displayNameObject: applyDefaultValueIdentifier(
              o,
              displayPattern
                ? intl.formatMessage(
                    { id: displayPattern },
                    {
                      number: getFormattedValue(o),
                    },
                  )
                : getFormattedValue(o),
            ),
            value: o,
          },
  );

  return (
    <div className="option-container">
      <h1>
        {intl.formatMessage({
          id: title,
          defaultMessage: 'option',
        })}
      </h1>
      <div className="select-container">
        <Select
          name={title}
          selected={`${currentSelection}`}
          options={uniqBy(
            sortByValue
              ? selectOptions.sort((a, b) => a.value - b.value)
              : selectOptions,
            o => o.value,
          )}
          onSelectChange={e => onOptionSelected(e.target.value)}
        />
        <Icon className="fake-select-arrow" img="icon-icon_arrow-dropdown" />
      </div>
    </div>
  );
};

/**
 * Represents the types of acceptable values.
 */
export const valueShape = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
]);

SelectOptionContainer.propTypes = {
  currentSelection: valueShape.isRequired,
  defaultValue: valueShape.isRequired,
  displayPattern: PropTypes.string,
  displayValueFormatter: PropTypes.func,
  highlightDefaultValue: PropTypes.bool,
  onOptionSelected: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        title: PropTypes.string.isRequired,
        value: valueShape.isRequired,
      }),
      PropTypes.number,
    ]).isRequired,
  ).isRequired,
  title: PropTypes.string.isRequired,
  sortByValue: PropTypes.bool,
};

SelectOptionContainer.defaultProps = {
  displayPattern: undefined,
  displayValueFormatter: undefined,
  highlightDefaultValue: true,
  sortByValue: false,
};

SelectOptionContainer.contextTypes = {
  intl: intlShape.isRequired,
};

export default SelectOptionContainer;
