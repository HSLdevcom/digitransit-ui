import PropTypes from 'prop-types';
import React, { useState } from 'react';
import moment from 'moment-timezone';
import styles from './styles.scss';
import utils from './utils';

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
  validate,
}) {
  const [inputValue, changeInputValue] = useState(getDisplay(value));
  moment.tz.setDefault(timeZone);
  const inputId = `${id}-input`;
  const labelId = `${id}-label`;
  return (
    <>
      <label className={styles['input-container']} htmlFor={inputId}>
        <span>{icon}</span>
        <span className={styles['sr-only']} id={labelId}>
          {label}
        </span>
        <input
          id={inputId}
          inputMode="numeric"
          type="text"
          maxLength="5"
          className={styles['time-input-mobile']}
          value={inputValue}
          onFocus={e => e.target.select()}
          onChange={event => {
            const newValue = event.target.value;
            const actual = utils.parseTypedTime(newValue);
            changeInputValue(actual);
            const timestamp = validate(actual, value);
            if (timestamp) {
              onChange(timestamp);
            }
          }}
        />
      </label>
    </>
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
  validate: PropTypes.func.isRequired,
};

MobileTimepicker.defaultProps = {
  icon: null,
  timeZone: 'Europe/Helsinki',
};

export default MobileTimepicker;
