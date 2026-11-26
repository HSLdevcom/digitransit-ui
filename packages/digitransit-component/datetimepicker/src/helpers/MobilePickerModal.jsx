import PropTypes from 'prop-types';
import { useState } from 'react';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import uniqueId from 'lodash/uniqueId';
import Modal from 'react-modal';
import Icon from '@digitransit-component/digitransit-component-icon';
import MobileDatepicker from './MobileDatepicker';
import MobileTimepicker from './MobileTimepicker';
import styles from './styles.scss';

/**
 * @param {object} props
 * @param {'arrival'|'departure'} props.departureOrArrival Whether the picker is for arrival or departure time
 * @param {function} props.onNowClick Called when the "Now" button is clicked
 * @param {string} props.lang Language code for translations
 * @param {string} props.color Color for the component, used in styles
 * @param {function} props.onSubmit Called when the user submits the selected date and time
 * @param {function} props.onCancel called when the user cancels the selection
 * @param {number} props.timestamp Initial timestamp to display in the picker
 * @param {number} props.dateSelectItemCount Determines how many date options are shown in the date picker
 * @returns {JSX.Element}
 */
export default function MobilePickerModal({
  departureOrArrival,
  onNowClick,
  lang,
  color = '#007ac9',
  onSubmit,
  onCancel,
  timestamp,
  dateSelectItemCount,
  onAfterClose,
}) {
  const [t] = useTranslation(undefined, { lng: lang });

  const [displayTimestamp, changeTimestamp] = useState(timestamp);

  const [departureOrArrivalCurrent, changeDepartureOrArrival] = useState(departureOrArrival);

  function onArrivalClick() {
    changeDepartureOrArrival('arrival');
  }

  function onDepartureClick() {
    changeDepartureOrArrival('departure');
  }

  // for input labels
  const [htmlId] = useState(uniqueId('datetimepicker-'));
  const dateSelectStartTime = DateTime.now()
    .startOf('day')
    .set({
      hour: DateTime.fromMillis(displayTimestamp).hour,
      minute: DateTime.fromMillis(displayTimestamp).minute,
    })
    .toMillis();

  return (
    <Modal
      appElement={document ? document.querySelector('#app') : undefined}
      isOpen
      className={styles['mobile-modal-content']}
      overlayClassName={styles['mobile-modal-overlay']}
      onAfterClose={onAfterClose}
    >
      <div id="digitransit-mobile-datetime" style={{ '--color': `${color}` }}>
        <div className={styles['top-row']}>
          <h3 className={styles['modal-title']}>{t('choose-time')}</h3>
          <button
            type="button"
            className={styles['departure-now-button']}
            onClick={onNowClick}
            aria-describedby={`${htmlId}-now-description`}
          >
            {t('departure-now')}
          </button>
          <span id={`${htmlId}-now-description`} className={styles['sr-only']}>
            {t('accessible-departure-now')}
          </span>
        </div>
        <div className={styles['tab-row']}>
          <label
            htmlFor={`${htmlId}-modal-departure`}
            className={`${styles['radio-tab-label']}
                ${styles[departureOrArrivalCurrent === 'departure' ? 'active' : undefined]}`}
          >
            {t('departure')}
            <input
              id={`${htmlId}-modal-departure`}
              name={`${htmlId}-departureOrArrival`}
              type="radio"
              value="departure"
              className={styles['radio-textbutton']}
              onChange={() => {
                onDepartureClick();
              }}
              checked={departureOrArrivalCurrent === 'departure'}
            />
          </label>
          <label
            htmlFor={`${htmlId}-modal-arrival`}
            className={`${styles['radio-tab-label']}
                ${styles[departureOrArrivalCurrent === 'arrival' ? 'active' : undefined]}`}
          >
            {t('arrival')}
            <input
              id={`${htmlId}-modal-arrival`}
              name={`${htmlId}-departureOrArrival`}
              type="radio"
              value="arrival"
              className={styles['radio-textbutton']}
              onChange={() => {
                onArrivalClick();
              }}
              checked={departureOrArrivalCurrent === 'arrival'}
            />
          </label>
        </div>
        <div className={styles['input-row']}>
          <MobileDatepicker
            value={displayTimestamp}
            onChange={changeTimestamp}
            itemCount={dateSelectItemCount}
            startTime={dateSelectStartTime}
            id={`${htmlId}-date`}
            label={t('date')}
            icon={
              <span className={`${styles['combobox-icon']} ${styles['date-input-icon']}`}>
                <Icon img="calendar" color={color} />
              </span>
            }
            lang={lang}
          />
          <MobileTimepicker
            value={displayTimestamp}
            onChange={changeTimestamp}
            id={`${htmlId}-time`}
            label={t('time')}
            icon={
              <span className={`${styles['combobox-icon']} ${styles['time-input-icon']}`}>
                <Icon img="time" color={color} />
              </span>
            }
          />
        </div>
        <div className={styles['buttons-row']}>
          <button
            type="button"
            className={styles['ready-button']}
            onClick={() => onSubmit(displayTimestamp, departureOrArrivalCurrent)}
          >
            {t('ready')}
          </button>
          <button type="button" className={styles['cancel-button']} onClick={onCancel}>
            {t('cancel')}
          </button>
        </div>
      </div>
    </Modal>
  );
}

MobilePickerModal.propTypes = {
  departureOrArrival: PropTypes.oneOf(['departure', 'arrival']).isRequired,
  onNowClick: PropTypes.func.isRequired,
  lang: PropTypes.string.isRequired,
  color: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onAfterClose: PropTypes.func.isRequired,
  timestamp: PropTypes.number.isRequired,
  dateSelectItemCount: PropTypes.number.isRequired,
};
