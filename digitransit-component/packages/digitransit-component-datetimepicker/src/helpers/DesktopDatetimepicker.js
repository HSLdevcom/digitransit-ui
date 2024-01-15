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
  const [showAllOptions, setShowAllOptions] = useState(true);
  const [validInput, setValidInput] = useState(true);
  useEffect(() => {
    changeDisplayValue(getDisplay(value));
    setValidInput(true);
  }, [value]);
  useEffect(() => {
    document.body.style.setProperty(
      '--input-color',
      validInput ? 'black' : 'red',
    );
  }, [validInput]);

  const validateClock = (hours, minutes) => {
    const hoursValid = !Number.isNaN(hours) && hours >= 0 && hours <= 23;
    const minutesLen = minutes > 10 ? 2 : 1;
    const minutesValid =
      !Number.isNaN(minutes) && minutesLen === 2
        ? minutes >= 0 && minutes <= 59
        : minutes >= 0 && minutes <= 5;
    return hoursValid && minutesValid;
  };
  const validateTime = inputValue => {
    if (inputValue.length <= 2) {
      // Too many options, don't  validate
      return undefined;
    }
    if (inputValue.length === 3) {
      let hours;
      let minutes;
      if (inputValue.includes(':')) {
        [hours, minutes] = inputValue.split(':');
      } else if (inputValue.startsWith('0')) {
        hours = inputValue.substring(0, inputValue.length - 1);
        minutes = inputValue.substring(inputValue.length - 1 || 0);
        if (Number(minutes) > 5) {
          return false;
        }
      } else {
        hours = inputValue.substring(0, inputValue.length - 2);
        minutes = inputValue.substring(inputValue.length - 2) || 0;
      }
      return validateClock(Number(hours), Number(minutes));
    }
    if (inputValue.length === 5 || inputValue.length === 4) {
      const values = inputValue.split(':');
      const hours = values[0];
      const minutes = values[1];
      if (
        inputValue.startsWith('0') &&
        minutes.length === 1 &&
        Number(minutes) > 5
      ) {
        return false;
      }
      return validateClock(Number(hours), Number(minutes));
    }
    return undefined;
  };

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
    const regex = /[a-zA-Z§ÄäÖö.-\s]/g;
    if (str.length < displayValue?.length) {
      const valid = validateTime(str);
      // If valid == undefined it means that there is only 2 digits left
      if (valid === undefined || valid !== validInput) {
        setValidInput(true);
      }
      return true;
    }
    if (regex.test(str)) {
      return false;
    }
    const time = str.length > 5 ? str.slice(0, -1) : str;
    const valid = validateTime(time);
    if (valid !== undefined && valid !== validInput) {
      setValidInput(valid);
    }
    return str.length <= 5;
  }
  const onInputChange = (newValue, { action }) => {
    if (action === 'menu-close') {
      setShowAllOptions(true);
    } else if (showAllOptions) {
      setShowAllOptions(false);
    }
    if (disableTyping || (newValue && !isValidInput(newValue))) {
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

  // Time picker has a list of minutes, instead of 15 minutes. We need to filter those out
  // so closest option will show up in the list.
  const closestOptions = datePicker
    ? options
    : options.filter(o => o.label.split(':')[1] % 15 === 0);
  const closestOption =
    closestOptions.length > 0
      ? closestOptions?.reduce((a, b) =>
          Math.abs(value - a.value) < Math.abs(value - b.value) ? a : b,
        )
      : undefined;
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
            const currentTime = moment(value).format('HH:mm');
            const validated = validate(displayValue, value);
            if (typing) {
              if (validated !== null) {
                if (currentTime !== displayValue && time.value === value) {
                  handleTimestamp(validated);
                } else {
                  handleTimestamp(time.value);
                }
                setTyping(false);
              } else {
                if (time.value !== value) {
                  handleTimestamp(time.value);
                } else {
                  // reset value
                  changeDisplayValue(getDisplay(value));
                }
                setTyping(false);
              }
              setValidInput(true);
              return;
            }
            setValidInput(true);
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
          noOptionsMessage={() => {
            return '';
          }}
          filterOption={(option, input) => {
            const completeInput =
              input.length === 5 ||
              (input.length === 4 && input.split(':')[0].length === 1);
            const isMod15 = option.label.split(':')[1] % 15 === 0;
            const minuteInput = input.split(':')[1]?.length === 1;

            if (datePicker) {
              return true;
            }
            if (showAllOptions && isMod15) {
              return true;
            }
            if (minuteInput) {
              const inputH =
                input.split(':')[0].length === 1
                  ? '0'.concat(input.split(':')[0])
                  : input.split(':')[0];
              const inputM = input.split(':')[1];
              const optH = option.label.split(':')[0];
              const optM = option.label.split(':')[1];
              if (inputH === optH) {
                const t = Number(inputM) * 10;
                const total = Number(optM) - t;
                if (total >= 0 && total <= 9) {
                  return true;
                }
                return false;
              }
            }
            if (completeInput && !showAllOptions) {
              return input.length === 4
                ? '0'.concat(input) === option.label
                : input === option.label;
            }
            if (isMod15) {
              return filterOptions(option, input);
            }

            return false;
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
            if (isValidInput) {
              setValidInput(true);
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
