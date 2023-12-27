import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import Select from 'react-select';
import utils from './utils';
import styles from './styles.scss';

/**
 * Component to display a date or time input on desktop.
 *
 * @param {Object} props
 * @param {Number} props.value    Currently selected time. Unix timestamp in milliseconds
 * @param {function} props.onChange     This is called with new timestamp when input is changed
 * @param {function} props.getDisplay   Function to get a string representation from a timestamp
 * @param {array}    props.timeChoices  Array of timestamps to choose from
 * @param {function} validate           Function to validate input when user types something and hits enter. Parameter is input as stringstring, return number timestamp if input is valid or null if invalid.
 * @param {string} id                   Id prefix for labels and aria attributes. Should be unique in page
 * @param {string} label                Text to show as input label
 * @param {node} icon                   JSX for icon to show in input
 * @param {boolean} disableTyping       Set to true to disable typing in the input
 * @param {boolean} datePicker          Is the picker DatePicker or TimePicker
 *
 * @example
 * <DesktopDatetimepicker
 *   value={1590133823000}
 *   onChange={timestamp => update(timestamp)}
 *   getDisplay={timestamp => formatTime(timestamp)}
 *   timeChoices={[1590133823000]}
 *   validate=(input => validateTimeString(input))
 *   id="timeinput"
 *   icon="<Icon />"
 *   disableTyping={false} // can be omitted if not true
 *   datePicker={true} // can be omitted if not true
 */
function DesktopDatetimepicker({
  value,
  onChange,
  getDisplay,
  timeChoices,
  validate,
  id,
  label,
  icon,
  disableTyping,
  timeZone,
  datePicker,
}) {
  moment.tz.setDefault(timeZone);
  const [displayValue, changeDisplayValue] = useState(getDisplay(value));
  const [typing, setTyping] = useState(false);

  useEffect(() => changeDisplayValue(getDisplay(value)), [value]);

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
  function isValidInput(str) {
    const clockRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const regex = /[a-zA-Z§ÄäÖö\s]/g;
    if (regex.test(str)) {
      return false;
    }
    return clockRegex.test(str) || str.length < 5;
  }
  const onInputChange = (newValue, { action }) => {
    if (disableTyping || !isValidInput(newValue)) {
      return;
    }
    if (action === 'input-change') {
      const validated = utils.parseTypedTime(newValue);
      changeDisplayValue(validated);
      setTyping(true);
    }
  };
  const options = timeChoices.map(t => {
    return { value: t.toString(), label: getDisplay(t) };
  });
  const closestOption = options.reduce((a, b) =>
    Math.abs(value - a.value) < Math.abs(value - b.value) ? a : b,
  );
  const inputId = `${id}-input`;
  const labelId = `${id}-label`;
  const filterOptions = (option, input) => {
    const hour = input.length <= 2 ? input : input.split(':')[0];
    const isValidHour = /^([0-1]?[0-9]|2[0-3])$/.test(hour);
    const comp = hour.length === 1 ? '0'.concat(input) : input;
    return isValidHour
      ? option.label.split(':')[0] === comp.split(':')[0]
      : true;
  };
  return (
    <>
      <label className={styles['combobox-container']} htmlFor={inputId}>
        <span className={styles['sr-only']} id={labelId}>
          {label} {displayValue}
        </span>
        {icon}
        <Select
          aria-labelledby={labelId}
          ariaLiveMessages={{
            guidance: () => {
              return '.'; // this can't be empty for some reason
            },
            onChange: () => {
              return '';
            },
            onFilter: () => {
              return '';
            },
            onFocus: ({ context, label: itemLabel }) => {
              if (context === 'menu') {
                return itemLabel;
              }
              return '';
            },
          }}
          options={options}
          inputId={inputId}
          onChange={time => {
            if (typing) {
              const validated = validate(displayValue, value);
              if (validated !== null) {
                handleTimestamp(validated);
                setTyping(false);
              } else {
                // reset value
                changeDisplayValue(getDisplay(value));
                setTyping(false);
              }
              return;
            }
            handleTimestamp(time.value);
          }}
          components={{
            IndicatorsContainer: () => null,
          }}
          className={styles['datetimepicker-select-container']}
          classNamePrefix="datetimepicker-select"
          onInputChange={onInputChange}
          inputValue={!disableTyping && displayValue}
          value={closestOption}
          filterOption={(option, input) => {
            if (datePicker) {
              return true;
            }
            if (input.length < 1 || input.length > 5) {
              return true;
            }
            return filterOptions(option, input);
          }}
          controlShouldRenderValue={disableTyping}
          tabSelectsValue={false}
          placeholder=""
          onFocus={e => {
            if (!disableTyping) {
              e.target.select();
            }
          }}
          onBlur={() => {
            // removing focus also locks in value
            if (typing) {
              const validated = validate(displayValue, value);
              if (validated !== null) {
                handleTimestamp(validated);
                setTyping(false);
              } else {
                changeDisplayValue(getDisplay(value));
                setTyping(false);
              }
            }
          }}
          onKeyDown={e => {
            if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
              setTyping(false);
            }
          }}
          isSearchable={!disableTyping}
        />
      </label>
    </>
  );
}
DesktopDatetimepicker.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  getDisplay: PropTypes.func.isRequired,
  timeChoices: PropTypes.arrayOf(PropTypes.number).isRequired,
  validate: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  label: PropTypes.node.isRequired,
  icon: PropTypes.node.isRequired,
  disableTyping: PropTypes.bool,
  timeZone: PropTypes.string,
  datePicker: PropTypes.bool,
};

DesktopDatetimepicker.defaultProps = {
  disableTyping: false,
  timeZone: 'Europe/Helsinki',
  datePicker: false,
};

export default DesktopDatetimepicker;
