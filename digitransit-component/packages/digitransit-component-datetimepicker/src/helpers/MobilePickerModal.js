import PropTypes from 'prop-types';
import React, { useState } from 'react';
import moment from 'moment-timezone';
import 'moment/locale/fi';
import uniqueId from 'lodash/uniqueId';
import i18next from 'i18next';
import Modal from 'react-modal';
import Icon from '@digitransit-component/digitransit-component-icon';
import MobileDatepicker from './MobileDatepicker';
import MobileTimepicker from './MobileTimepicker';
import translations from './translations';
import styles from './styles.scss';

moment.locale('en');
i18next.init({ lng: 'en', resources: {} });
Object.keys(translations).forEach(lang =>
  i18next.addResourceBundle(lang, 'translation', translations[lang]),
);

/**
 * TODO
 */
function MobilePickerModal({
  departureOrArrival,
  onNowClick,
  lang,
  color,
  timeZone,
  onSubmit,
  onCancel,
  timestamp,
  getTimeDisplay,
  dateSelectItemCount,
  getDateDisplay,
  validateTime,
  fontWeights,
}) {
  moment.tz.setDefault(timeZone);
  const translationSettings = { lng: lang };

  const [displayTimestamp, changeTimestamp] = useState(timestamp);

  const [departureOrArrivalCurrent, changeDepartureOrArrival] = useState(
    departureOrArrival,
  );

  function onArrivalClick() {
    changeDepartureOrArrival('arrival');
  }

  function onDepartureClick() {
    changeDepartureOrArrival('departure');
  }

  function onDateChange(newValue) {
    changeTimestamp(newValue);
  }

  function onTimeChange(newValue) {
    changeTimestamp(newValue);
  }

  // for input labels
  const [htmlId] = useState(uniqueId('datetimepicker-'));
  const dateSelectStartTime = moment()
    .startOf('day')
    .hour(moment(displayTimestamp).hour())
    .minute(moment(displayTimestamp).minute())
    .valueOf();

  return (
    <Modal
      appElement={document ? document.querySelector('#app') : undefined}
      isOpen
      className={styles['mobile-modal-content']}
      overlayClassName={styles['mobile-modal-overlay']}
    >
      <div
        style={{
          '--color': `${color}`,
          '--font-weight-bold': fontWeights.bold,
        }}
      >
        <div className={styles['top-row']}>
          <h3 className={styles['modal-title']}>
            {i18next.t('choose-time', translationSettings)}
          </h3>
          <button
            type="button"
            className={styles['departure-now-button']}
            onClick={onNowClick}
          >
            {i18next.t('departure-now', translationSettings)}
          </button>
        </div>
        <div className={styles['tab-row']}>
          <label
            htmlFor={`${htmlId}-modal-departure`}
            className={`${styles['radio-tab-label']}
                ${
                  styles[
                    departureOrArrivalCurrent === 'departure'
                      ? 'active'
                      : undefined
                  ]
                }`}
          >
            {i18next.t('departure', translationSettings)}
            <input
              id={`${htmlId}-modal-departure`}
              name="departureOrArrival"
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
                ${
                  styles[
                    departureOrArrivalCurrent === 'arrival'
                      ? 'active'
                      : undefined
                  ]
                }`}
          >
            {i18next.t('arrival', translationSettings)}
            <input
              id={`${htmlId}-modal-arrival`}
              name="departureOrArrival"
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
            getDisplay={getDateDisplay}
            onChange={onDateChange}
            itemCount={dateSelectItemCount}
            startTime={dateSelectStartTime}
            id={`${htmlId}-date`}
            label={i18next.t('date', translationSettings)}
            icon={
              <span
                className={`${styles['combobox-icon']} ${styles['date-input-icon']}`}
              >
                <Icon img="calendar" color={color} />
              </span>
            }
            timeZone={timeZone}
          />
          <MobileTimepicker
            value={displayTimestamp}
            getDisplay={getTimeDisplay}
            onChange={onTimeChange}
            id={`${htmlId}-time`}
            label={i18next.t('time', translationSettings)}
            icon={
              <span
                className={`${styles['combobox-icon']} ${styles['time-input-icon']}`}
              >
                <Icon img="time" color={color} />
              </span>
            }
            timeZone={timeZone}
            validate={validateTime}
          />
        </div>
        <div className={styles['buttons-row']}>
          <button
            type="button"
            className={styles['ready-button']}
            onClick={() =>
              onSubmit(displayTimestamp, departureOrArrivalCurrent)
            }
          >
            {i18next.t('ready', translationSettings)}
          </button>
          <button
            type="button"
            className={styles['cancel-button']}
            onClick={onCancel}
          >
            {i18next.t('cancel', translationSettings)}
          </button>
        </div>
      </div>
    </Modal>
  );
}

MobilePickerModal.propTypes = {
  timeZone: PropTypes.string,
  departureOrArrival: PropTypes.oneOf(['departure', 'arrival']).isRequired,
  onNowClick: PropTypes.func.isRequired,
  lang: PropTypes.string.isRequired,
  color: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  timestamp: PropTypes.number.isRequired,
  getTimeDisplay: PropTypes.func.isRequired,
  dateSelectItemCount: PropTypes.number.isRequired,
  getDateDisplay: PropTypes.func.isRequired,
  validateTime: PropTypes.func.isRequired,
  fontWeights: PropTypes.shape({
    bold: PropTypes.number.isRequired,
  }).isRequired,
};

MobilePickerModal.defaultProps = {
  color: '#007ac9',
  timeZone: 'Europe/Helsinki',
};

export default MobilePickerModal;
