import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import Icon from '../Icon';
import Select from '../Select';

const SelectOptionContainer = (
  {
    currentSelection,
    displayPattern,
    displayValueFormatter,
    options,
    paramTitle,
    title,
  },
  { intl },
) => {
  const selectOptions = options.map(
    o =>
      o.title && o.value
        ? {
            displayName: `${displayPattern} ${
              displayValueFormatter ? displayValueFormatter(o.value) : o.value
            }`,
            value: o.value,
          }
        : {
            displayName: '',
            displayNameObject: intl.formatMessage(
              { id: displayPattern },
              {
                number: displayValueFormatter ? displayValueFormatter(o) : o,
              },
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
          selected={currentSelection}
          options={selectOptions}
          onSelectChange={e =>
            this.updateParameters({
              [paramTitle]: e.target.value,
            })
          }
        />
        <Icon className="fake-select-arrow" img="icon-icon_arrow-dropdown" />
      </div>
    </div>
  );
};

SelectOptionContainer.propTypes = {
  currentSelection: PropTypes.string.isRequired,
  displayPattern: PropTypes.string.isRequired,
  displayValueFormatter: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.oneOf([
      PropTypes.shape({
        title: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
      }),
      PropTypes.number,
    ]).isRequired,
  ).isRequired,
  paramTitle: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

SelectOptionContainer.defaultProps = {
  displayValueFormatter: undefined,
};

SelectOptionContainer.contextTypes = {
  intl: intlShape.isRequired,
};

export default SelectOptionContainer;
