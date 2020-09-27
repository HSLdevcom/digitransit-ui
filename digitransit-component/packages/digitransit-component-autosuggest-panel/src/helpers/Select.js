import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Autosuggest from 'react-autosuggest';
import styles from './select.scss';

const Select = ({
  value,
  getDisplay,
  options,
  onSlackTimeSelected,
  viaPointIndex,
  id,
  label,
  icon,
}) => {
  const [displayValue, changeDisplayValue] = useState(getDisplay(value));
  const [open, changeOpen] = useState(false);
  useEffect(() => changeDisplayValue(getDisplay(value)), [value]);
  const scrollRef = useRef(null);
  const scrollIndex = Math.floor(value / 600);
  const elementHeight = 50;
  useLayoutEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = elementHeight * scrollIndex;
    }
  }, [value, open]);

  const inputId = `${id}-input`;
  const labelId = `${id}-label`;

  const onInputChange = (_, { newValue, method }) => {
    switch (method) {
      case 'enter':
      case 'click':
        onSlackTimeSelected(newValue, viaPointIndex);
        break;
      case 'escape':
        changeDisplayValue(value);
        break;
      case 'up':
      case 'down':
      default:
        break;
    }
  };
  return (
    <>
      <label className={styles['combobox-container']} htmlFor={inputId}>
        <span className={styles['left-column']}>
          <span className={styles['combobox-label']} id={labelId}>
            {label}
          </span>
          <Autosuggest
            id={id}
            suggestions={options}
            getSuggestionValue={s => s.value}
            renderSuggestion={s => s.displayName}
            onSuggestionsFetchRequested={() => null}
            shouldRenderSuggestions={() => true}
            focusInputOnSuggestionClick={false}
            onSuggestionsClearRequested={() => null}
            inputProps={{
              value: displayValue,
              onChange: onInputChange,
              onFocus: () => {
                changeOpen(true);
              },
              onBlur: () => {
                changeOpen(false);
              },
              id: inputId,
              'aria-labelledby': labelId,
              'aria-autocomplete': 'none',
              readOnly: true,
            }}
            renderSuggestionsContainer={({ containerProps, children }) => {
              // set refs for autosuggest library and scrollbar positioning
              const { ref, ...otherRefs } = containerProps;
              const containerRef = elem => {
                if (elem) {
                  scrollRef.current = elem;
                  ref(elem);
                }
              };
              return (
                <div tabIndex="-1" {...otherRefs} ref={containerRef}>
                  {children}
                </div>
              );
            }}
            theme={styles}
          />
        </span>
        {icon}
      </label>
    </>
  );
};

Select.propTypes = {
  value: PropTypes.number.isRequired,
  onSlackTimeSelected: PropTypes.func.isRequired,
  getDisplay: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      displayName: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    }).isRequired,
  ).isRequired,
  id: PropTypes.string.isRequired,
  label: PropTypes.node.isRequired,
  icon: PropTypes.node.isRequired,
  viaPointIndex: PropTypes.number.isRequired,
};

export default Select;
