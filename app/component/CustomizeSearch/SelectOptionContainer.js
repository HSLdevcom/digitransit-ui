import ceil from 'lodash/ceil';
import uniqBy from 'lodash/uniqBy';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import Icon from '../Icon';
import Select from '../Select';

export const getFiveStepOptions = (defaultValue, reverse = false) => {
  const multipliers = [1 / 3, 2 / 3, 2, 5];
  if (reverse) {
    multipliers.reverse();
  }

  return [
    {
      title: 'option-amount-least',
      value: ceil(multipliers[0] * defaultValue, 3),
    },
    {
      title: 'option-amount-less',
      value: ceil(multipliers[1] * defaultValue, 3),
    },
    { title: 'option-amount-default', value: defaultValue },
    {
      title: 'option-amount-more',
      value: ceil(multipliers[2] * defaultValue, 3),
    },
    {
      title: 'option-amount-most',
      value: ceil(multipliers[3] * defaultValue, 3),
    },
  ];
};

const SelectOptionContainer = (
  {
    currentSelection,
    defaultValue,
    displayPattern,
    displayValueFormatter,
    highlightDefaultValue,
    options,
    title,
    onOptionSelected,
  },
  { intl },
) => {
  const getDefaultValueIdentifier = value =>
    highlightDefaultValue && value === defaultValue
      ? ` (${intl.formatMessage({ id: 'default-value' })})`
      : '';
  const getFormattedValue = value =>
    displayValueFormatter ? displayValueFormatter(value) : value;

  const selectOptions = options
    .map(
      o =>
        o.title && o.value
          ? {
              displayName: `${o.title}_${o.value}`,
              displayNameObject: `${intl.formatMessage(
                { id: o.title },
                {
                  title: o.title,
                },
              )}${getDefaultValueIdentifier(o.value)}`,
              value: o.value,
            }
          : {
              displayName: `${displayPattern}_${o}`,
              displayNameObject: `${
                displayPattern
                  ? intl.formatMessage(
                      { id: displayPattern },
                      {
                        number: getFormattedValue(o),
                      },
                    )
                  : getFormattedValue(o)
              }${getDefaultValueIdentifier(o)}`,
              value: o,
            },
    )
    .sort((a, b) => a.value - b.value);
  const uniqueOptions = uniqBy(selectOptions, o => o.value);

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
          selected={currentSelection}
          options={uniqueOptions}
          onSelectChange={e => onOptionSelected(e.target.value)}
        />
        <Icon className="fake-select-arrow" img="icon-icon_arrow-dropdown" />
      </div>
    </div>
  );
};

SelectOptionContainer.propTypes = {
  currentSelection: PropTypes.string.isRequired,
  defaultValue: PropTypes.oneOf([PropTypes.string, PropTypes.number])
    .isRequired,
  displayPattern: PropTypes.string,
  displayValueFormatter: PropTypes.func,
  highlightDefaultValue: PropTypes.bool,
  onOptionSelected: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.oneOf([
      PropTypes.shape({
        title: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
      }),
      PropTypes.number,
    ]).isRequired,
  ).isRequired,
  title: PropTypes.string.isRequired,
};

SelectOptionContainer.defaultProps = {
  displayPattern: undefined,
  displayValueFormatter: undefined,
  highlightDefaultValue: true,
};

SelectOptionContainer.contextTypes = {
  intl: intlShape.isRequired,
};

export default SelectOptionContainer;
