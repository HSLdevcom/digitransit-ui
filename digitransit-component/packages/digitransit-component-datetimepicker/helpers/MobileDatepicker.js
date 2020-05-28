import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment-timezone';
import styles from './styles.scss';

moment.tz.setDefault('Europe/Helsinki');

/**
 * Component to display a date input on mobile
 */
function MobileDatepicker({
  value,
  getDisplay,
  onChange,
  itemCount,
  startTime,
  id,
  label,
  icon,
}) {
  const startFormatted = moment(startTime).format('YYYY-MM-DD');
  const endFormatted = moment(startTime)
    .add(itemCount, 'day')
    .format('YYYY-MM-DD');

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
          {/* Hide input element and show formatted date instead for consistency between browsers */}
          <input
            id={inputId}
            type="date"
            className={styles['mobile-input-hidden']}
            value={moment(value).format('YYYY-MM-DD')}
            min={startFormatted}
            max={endFormatted}
            onChange={event => {
              const newValue = event.target.value;
              if (!newValue) {
                // don't allow setting input to empty
                return;
              }
              const oldDate = moment(value);
              const newDate = moment(newValue);
              const combined = oldDate
                .year(newDate.year())
                .month(newDate.month())
                .date(newDate.date());
              onChange(combined.valueOf());
            }}
          />
        </span>
        {icon}
      </label>
    </>
  );
}
MobileDatepicker.propTypes = {
  value: PropTypes.number.isRequired,
  getDisplay: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  itemCount: PropTypes.number.isRequired,
  startTime: PropTypes.number.isRequired,
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.node,
};

MobileDatepicker.defaultProps = {
  icon: null,
};

export default MobileDatepicker;
