import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import moment from 'moment';
import Autosuggest from 'react-autosuggest';
import styles from './styles.scss';

/**
 * Component to display a date or time input on desktop.
 *
 * @param {Object} props
 * @param {Number} props.value    Currently selected time. Unix timestamp in milliseconds
 * @param {function} props.onChange     This is called with new timestamp when input is changed
 * @param {function} props.getDisplay   Function to get a string representation from a timestamp
 * @param {Number} props.itemCount      Number of time values that is shown in dropdown
 * @param {Number} itemDiff             Difference in milliseconds between time values in dropdown
 * @param {Number} startTime            Timestamp for the first selectable dropdown value
 * @param {function} validate           Function to validate input when user types something and hits enter. Parameter is input as stringstring, return number timestamp if input is valid or null if invalid.
 * @param {string} id                   Id prefix for labels and aria attributes. Should be unique in page
 * @param {string} label                Text to show as input label
 * @param {node} icon                   JSX for icon to show in input
 * @param {boolean} disableTyping       Set to true to disable typing in the input
 *
 * @example
 * <DesktopDatetimepicker
 *   value={1590133823000}
 *   onChange={timestamp => update(timestamp)}
 *   getDisplay={timestamp => formatTime(timestamp)}
 *   itemCount={24 * 4}
 *   itemDiff={1000 * 60 * 15} // 15 minute intervals
 *   startTime{startOfToday}
 *   validate=(input => validateTimeString(input))
 *   id="timeinput"
 *   icon="<Icon />"
 *   disableTyping={false} // can be omitted if not true
 */
function DesktopDatetimepicker({
  value,
  onChange,
  getDisplay,
  itemCount,
  itemDiff,
  startTime,
  validate,
  id,
  label,
  icon,
  disableTyping,
}) {
  const [displayValue, changeDisplayValue] = useState(getDisplay(value));

  useEffect(() => changeDisplayValue(getDisplay(value)), [value]);

  // keep track of dropdown state for scroll position management
  const [open, changeOpen] = useState(false);
  const scrollRef = useRef(null);
  const scrollIndex = Math.floor((value - startTime) / itemDiff);
  const elementHeight = 50;
  // scroll to selected time when dropdown is opened
  useLayoutEffect(
    () => {
      if (open && scrollRef.current) {
        scrollRef.current.scrollTop = elementHeight * scrollIndex;
      }
    },
    [value, open],
  );

  const timeSuggestions = Array(itemCount)
    .fill()
    .map((_, i) => startTime + i * itemDiff);

  // newValue is string
  const handleTimestamp = newValue => {
    const asNumber = Number(newValue);
    if (
      Number.isNaN(asNumber) ||
      !moment(asNumber).isValid() ||
      moment(asNumber).valueOf() !== asNumber
    ) {
      // TODO handle error?
      return;
    }
    onChange(asNumber);
  };

  // only enter or click will trigger actual change of value
  // if user first types something in field and then selects an item from list, both 'inputenter' and 'enter' events will trigger, this needs to be handled.
  const onInputChange = (_, { newValue, method }) => {
    let validated;
    switch (method) {
      case 'type':
        if (!disableTyping) {
          changeDisplayValue(newValue);
        }
        break;
      case 'inputenter':
        if (!disableTyping) {
          validated = validate(newValue);
          if (validated !== null) {
            handleTimestamp(validated);
          } else {
            // TODO handle invalid input?
          }
        }
        break;
      case 'enter':
      case 'click':
        handleTimestamp(newValue);
        break;
      case 'escape':
        changeDisplayValue(getDisplay(value));
        break;
      case 'up':
      case 'down':
      default:
        break;
    }
  };
  const inputId = `${id}-input`;
  const labelId = `${id}-label`;
  return (
    <>
      <label className={styles['combobox-container']} htmlFor={inputId}>
        <span className={styles['left-column']}>
          <span className={styles['combobox-label']} id={labelId}>
            {label}
          </span>
          <Autosuggest
            id={id}
            suggestions={timeSuggestions}
            getSuggestionValue={s => s.toString()}
            renderSuggestion={s => getDisplay(s)}
            onSuggestionsFetchRequested={() => null}
            shouldRenderSuggestions={() => true}
            inputProps={{
              value: displayValue,
              onChange: onInputChange,
              onFocus: () => {
                changeOpen(true);
              },
              onBlur: () => {
                changeOpen(false);
                changeDisplayValue(getDisplay(value));
              },
              onKeyDown: e => {
                if (e.keyCode === 13) {
                  if (e.target.value !== getDisplay(value)) {
                    // this means user probably typed something
                    onInputChange(e, {
                      newValue: e.target.value,
                      method: 'inputenter',
                    });
                  }
                }
              },
              id: inputId,
              'aria-labelledby': labelId,
              'aria-autocomplete': 'none',
              readOnly: disableTyping,
            }}
            focusInputOnSuggestionClick={false}
            onSuggestionsClearRequested={() => null}
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
}
DesktopDatetimepicker.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  getDisplay: PropTypes.func.isRequired,
  itemCount: PropTypes.number.isRequired,
  itemDiff: PropTypes.number.isRequired,
  startTime: PropTypes.number.isRequired,
  validate: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  label: PropTypes.node.isRequired,
  icon: PropTypes.node.isRequired,
  disableTyping: PropTypes.bool,
};

DesktopDatetimepicker.defaultProps = {
  disableTyping: false,
};

export default DesktopDatetimepicker;
