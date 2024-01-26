import PropTypes from 'prop-types';
import React, { useRef, useLayoutEffect, useState } from 'react';
import moment from 'moment-timezone';
import cx from 'classnames';
import styles from './styles.scss';
import { parseTypedTime, getTs, validateInput } from './utils';

/**
 * Component to display a time input on mobile
 */
function MobileTimepicker({
  value,
  getDisplay,
  onChange,
  id,
  label,
  icon,
  timeZone,
}) {
  const [inputValue, changeInputValue] = useState(getDisplay(value));
  const [invalidInput, setinvalidInput] = useState(false);
  moment.tz.setDefault(timeZone);
  const inputId = `${id}-input`;
  const labelId = `${id}-label`;
  const timeInputRef = useRef(null);
  useLayoutEffect(() => {
    if (timeInputRef.current) {
      timeInputRef.current.focus();
    }
  }, []);
  return (
    <label className={styles['input-container']} htmlFor={inputId}>
      <span>{icon}</span>
      <span className={styles['sr-only']} id={labelId}>
        {label}
      </span>
      <input
        id={inputId}
        inputMode="numeric"
        type="text"
        maxLength="6"
        className={cx(
          styles['time-input-mobile'],
          invalidInput ? 'mobile-datetimepicker-invalid-input' : '',
        )}
        value={inputValue}
        onFocus={e => {
          e.target.setSelectionRange(0, 0); // set caret to start of input
        }}
        onChange={event => {
          let newValue = event.target.value;
          const valid = validateInput(newValue);
          setinvalidInput(valid);
          if (
            // number typed as first char => clear rest of the input
            newValue.match(/[0-9]{3}:[0-9]{2}/) &&
            newValue.slice(1) === inputValue
          ) {
            newValue = newValue.charAt(0);
          }
          if (newValue.length > 5) {
            return;
          }
          const actual = parseTypedTime(newValue);
          changeInputValue(actual);
          const timestamp = getTs(actual, value);
          if (timestamp) {
            onChange(timestamp);
          }
        }}
        ref={timeInputRef}
      />
    </label>
  );
}
MobileTimepicker.propTypes = {
  value: PropTypes.number.isRequired,
  getDisplay: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.node,
  timeZone: PropTypes.string,
};

MobileTimepicker.defaultProps = {
  icon: null,
  timeZone: 'Europe/Helsinki',
};

export default MobileTimepicker;
