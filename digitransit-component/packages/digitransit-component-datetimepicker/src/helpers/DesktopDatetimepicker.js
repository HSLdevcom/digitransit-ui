import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import Select from 'react-select';
import i18next from 'i18next';
import { parseTypedTime, validateInput, getTs } from './utils';
import styles from './styles.scss';

/**
 * Component to display a date or time input on desktop.
 *
 * @param {Object} props
 * @param {Number} props.value    Currently selected time. Unix timestamp in milliseconds
 * @param {function} props.onChange     This is called with new timestamp when input is changed
 * @param {function} props.getDisplay   Function to get a string representation from a timestamp
 * @param {array}    props.timeChoices  Array of timestamps to choose from
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
  id,
  label,
  icon,
  disableTyping,
  timeZone,
  datePicker,
  invalidInput,
  setinvalidInput,
  translationSettings,
}) {
  moment.tz.setDefault(timeZone);
  const [displayValue, changeDisplayValue] = useState(getDisplay(value));
  const [typing, setTyping] = useState(false);
  const [showAllOptions, setShowAllOptions] = useState(true);
  useEffect(() => {
    changeDisplayValue(getDisplay(value));
    if (!datePicker) {
      setinvalidInput(false);
    }
  }, [value]);

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
  function isinvalidInput(str) {
    const regex = /[a-zA-Z§ÄäÖö.-\s]/g;
    if (str.length < displayValue?.length) {
      const valid = validateInput(str);
      setinvalidInput(valid);

      return true;
    }
    if (regex.test(str)) {
      return false;
    }
    const time = str.length > 5 ? str.slice(0, -1) : str;
    const valid = validateInput(time);
    setinvalidInput(valid);
    return str.length <= 5;
  }
  const onInputChange = (newValue, { action }) => {
    if (action === 'menu-close') {
      setShowAllOptions(true);
    } else if (showAllOptions) {
      setShowAllOptions(false);
    }
    if (disableTyping || (newValue && !isinvalidInput(newValue))) {
      return;
    }
    if (action === 'input-change') {
      const validated = parseTypedTime(newValue);
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
  const ariaError = i18next.t('invalid-input', translationSettings);
  return (
    <label className={styles['combobox-container']} htmlFor={inputId}>
      <span className={styles['sr-only']} id={labelId}>
        {label} {displayValue}
      </span>
      {icon}
      <Select
        aria-labelledby={labelId}
        ariaLiveMessages={{
          guidance: context => {
            // When user types invalid value, isDisabled becomes undefined instead of false
            if (context.isDisabled === undefined && invalidInput) {
              return ariaError;
            }
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
          const ts = getTs(displayValue, value);
          if (typing) {
            if (ts !== null) {
              if (currentTime !== displayValue && time.value === value) {
                handleTimestamp(ts);
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
            if (!datePicker) {
              setinvalidInput(false);
            }
            return;
          }
          if (!datePicker) {
            setinvalidInput(false);
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
        noOptionsMessage={() => {
          return '';
        }}
        filterOption={(option, input) => {
          if (datePicker) {
            return true;
          }
          const completeInput =
            input.length === 5 ||
            (input.length === 4 && input.split(':')[0].length === 1);
          const isMod15 = option.label.split(':')[1] % 15 === 0;
          const minuteInput = input.split(':')[1]?.length === 1;

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
            const validated = getTs(displayValue, value);
            if (validated !== null) {
              handleTimestamp(validated);
              setTyping(false);
            } else {
              changeDisplayValue(getDisplay(value));
              setTyping(false);
            }
          }
          if (!datePicker) {
            setinvalidInput(false);
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
  );
}
DesktopDatetimepicker.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  getDisplay: PropTypes.func.isRequired,
  timeChoices: PropTypes.arrayOf(PropTypes.number).isRequired,
  id: PropTypes.string.isRequired,
  label: PropTypes.node.isRequired,
  icon: PropTypes.node.isRequired,
  disableTyping: PropTypes.bool,
  timeZone: PropTypes.string,
  datePicker: PropTypes.bool,
  invalidInput: PropTypes.bool,
  setinvalidInput: PropTypes.func,
  translationSettings: PropTypes.shape({ lng: PropTypes.string.isRequired }),
};

DesktopDatetimepicker.defaultProps = {
  disableTyping: false,
  timeZone: 'Europe/Helsinki',
  datePicker: false,
  invalidInput: false,
  setinvalidInput: () => null,
  translationSettings: { lng: 'fi' },
};

export default DesktopDatetimepicker;
