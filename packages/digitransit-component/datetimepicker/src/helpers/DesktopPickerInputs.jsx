import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '@digitransit-component/digitransit-component-icon';
import DesktopDatetimepicker from './DesktopDatetimepicker';
import { isMobile } from './mobileDetection';
import { getPickerChoices } from './utils';
import styles from './styles.scss';

/**
 * Date and time comboboxes of the desktop picker.
 */
export default function DesktopPickerInputs({
  timestamp,
  displayTimestamp,
  serviceTimeRange,
  onDateChange,
  onTimeChange,
  htmlId,
  color,
  lang,
  isOpen,
}) {
  const [t] = useTranslation(undefined, { lng: lang });

  // compute choices only when timestamp changes instead of every render
  const [timeChoices, dateChoices] = useMemo(
    () =>
      getPickerChoices({
        timestamp,
        displayTimestamp,
        serviceTimeRange,
        stepMinutes: isMobile() ? 15 : 1,
      }),
    [timestamp],
  );

  return (
    <div
      className={
        isOpen ? `${styles['picker-container']}` : `${styles.hidden} datetimepicker-top-row`
      }
    >
      <span className={styles['combobox-left']}>
        <DesktopDatetimepicker
          value={displayTimestamp}
          onChange={onDateChange}
          timeChoices={dateChoices}
          icon={
            <span className={`${styles['combobox-icon']} ${styles['date-input-icon']}`}>
              <Icon img="calendar" color={color} />
            </span>
          }
          id={`${htmlId}-date`}
          label={t('date')}
          disableTyping
          lang={lang}
          datePicker
        />
      </span>
      <span className={styles['combobox-right']}>
        <DesktopDatetimepicker
          value={displayTimestamp}
          onChange={onTimeChange}
          timeChoices={timeChoices}
          icon={
            <span className={`${styles['combobox-icon']} ${styles['time-input-icon']}`}>
              <Icon img="time" color={color} />
            </span>
          }
          id={`${htmlId}-time`}
          label={t('time')}
          lang={lang}
        />
      </span>
    </div>
  );
}

DesktopPickerInputs.propTypes = {
  timestamp: PropTypes.number,
  displayTimestamp: PropTypes.number.isRequired,
  serviceTimeRange: PropTypes.number.isRequired,
  onDateChange: PropTypes.func.isRequired,
  onTimeChange: PropTypes.func.isRequired,
  htmlId: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  lang: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
};
