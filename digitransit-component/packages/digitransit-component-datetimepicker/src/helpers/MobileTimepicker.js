import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import styles from './styles.scss';

moment.tz.setDefault('Europe/Helsinki');

/**
 * Component to display a time input on mobile
 */
function MobileTimepicker({ value, getDisplay, onChange, id, label, icon }) {
  const inputId = `${id}-input`;
  const labelId = `${id}-label`;
  return (
    <>
      <label className={styles['combobox-container']} htmlFor={inputId}>
        <span className={styles['left-column']}>
          <span className={styles['combobox-label']} id={labelId}>
            {label}
          </span>
          <span className={styles['mobile-input-display']}>
            {getDisplay(value)}
          </span>
          {/* Hide input element and show formatted time instead for consistency between browsers */}
          <input
            id={inputId}
            type="time"
            className={styles['mobile-input-hidden']}
            value={moment(value).format('HH:mm')}
            onChange={event => {
              const newValue = event.target.value;
              if (!newValue) {
                // don't allow setting input to empty
                return;
              }
              const oldDate = moment(value);
              const [hours, minutes] = newValue.split(':');
              const combined = oldDate.hours(hours).minutes(minutes);
              onChange(combined.valueOf());
            }}
          />
        </span>
        {icon}
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
};

MobileTimepicker.defaultProps = {
  icon: null,
};

export default MobileTimepicker;
