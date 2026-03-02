import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from '../../Icon';
import { useTranslationsContext } from '../../../util/useTranslationsContext';

/**
 * Represents the types of acceptable values.
 */
export const valueShape = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
  // eslint-disable-next-line
  PropTypes.object,
]);

export default function SearchSettingsDropdown({
  labelId,
  options,
  currentSelection,
  onOptionSelected,
  name,
}) {
  const intl = useTranslationsContext();
  const [showDropdown, setShowDropdown] = useState(false);
  const labelRef = useRef(null);

  useEffect(() => {
    if (showDropdown && labelRef.current) {
      labelRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [showDropdown]);

  const toggleDropdown = prevState => {
    setShowDropdown(!prevState);
  };

  const handleDropdownClick = prevState => {
    toggleDropdown(prevState);
  };

  const handleChangeOnly = value => {
    onOptionSelected(value);
  };

  const getOptionTags = (dropdownOptions, prevState) => {
    return dropdownOptions.map(option => (
      <li key={option.title + option.value}>
        <label
          className={`settings-dropdown-choice ${
            option.value === currentSelection.value ? 'selected' : ''
          }`}
          htmlFor={`dropdown-${name}-${option.value}`}
        >
          <span> {option.title} </span>
          <span className="right-side">
            <span className="kmh-value">{option.kmhValue}</span>
            <span className="checkmark">
              &nbsp;
              {option.value === currentSelection.value && (
                <Icon className="selected-checkmark" img="icon_check" />
              )}
            </span>
            <input
              id={`dropdown-${name}-${option.value}`}
              type="radio"
              name={name}
              checked={option.value === currentSelection.value}
              value={option.value}
              onChange={e => {
                handleChangeOnly(option.value);
                // try to detect if event is from an actual click or keyboard navigation
                if (e.nativeEvent.clientX || e.nativeEvent.clientY) {
                  handleDropdownClick(prevState);
                }
              }}
            />
          </span>
        </label>
      </li>
    ));
  };

  return (
    <div className="settings-dropdown-wrapper" ref={labelRef}>
      <button
        type="button"
        className="settings-dropdown-label"
        onClick={() => toggleDropdown(showDropdown)}
      >
        <FormattedMessage id={labelId} />
        <span className="settings-dropdown-text-container">
          <p className="settings-dropdown-label-value">
            {currentSelection.title}
          </p>
          <span
            aria-label={intl.formatMessage({
              id: showDropdown
                ? 'settings-dropdown-close-label'
                : 'settings-dropdown-open-label',
            })}
          />
          <Icon
            className={
              showDropdown ? 'fake-select-arrow inverted' : 'fake-select-arrow'
            }
            img="icon_arrow-dropdown"
          />
        </span>
      </button>
      {showDropdown && (
        <ul role="radiogroup" className="settings-dropdown">
          {getOptionTags(options, showDropdown)}
        </ul>
      )}
    </div>
  );
}

SearchSettingsDropdown.propTypes = {
  labelId: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(valueShape).isRequired,
  currentSelection: PropTypes.shape({
    title: PropTypes.string,
    value: valueShape,
  }).isRequired,
  onOptionSelected: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
};
