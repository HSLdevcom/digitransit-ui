import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment-timezone';
import styles from './styles.scss';

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
  dateTimeCombined,
  timeZone,
}) {
  moment.tz.setDefault(timeZone);
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
            type={dateTimeCombined ? 'datetime-local' : 'time'}
            className={styles['mobile-input-hidden']}
            value={
              dateTimeCombined
                ? moment(value).format('YYYY-MM-DDTHH:mm')
                : moment(value).format('HH:mm')
            }
            onChange={event => {
              const newValue = event.target.value;
              if (!newValue) {
                // don't allow setting input to empty
                return;
              }
              if (dateTimeCombined) {
                onChange(moment(newValue).valueOf());
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
  dateTimeCombined: PropTypes.bool,
  timeZone: PropTypes.string,
};

MobileTimepicker.defaultProps = {
  icon: null,
  dateTimeCombined: false,
  timeZone: 'Europe/Helsinki',
};

export default MobileTimepicker;
