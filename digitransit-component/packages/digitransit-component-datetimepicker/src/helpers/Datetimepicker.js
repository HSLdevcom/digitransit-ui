import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import moment from 'moment-timezone';
import 'moment/locale/fi';
import uniqueId from 'lodash/uniqueId';
import i18next from 'i18next';
import Icon from '@digitransit-component/digitransit-component-icon';
import DesktopDatetimepicker from './DesktopDatetimepicker';
import translations from './translations';
import styles from './styles.scss';
import { isMobile } from './mobileDetection';
import dateTimeInputIsSupported from './dateTimeInputIsSupported';
import MobilePickerModal from './MobilePickerModal';

moment.locale('en');
i18next.init({
  lng: 'fi',
  fallbackLng: 'fi',
  defaultNS: 'translation',
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
});

/**
 * This component renders combobox style inputs for selecting date and time. This is a controlled component, timestamp is the current value of both inputs.
 * @param {Object} props
 *
 * @param {Number} props.timestamp      Currently selected time as a unix timestamp in milliseconds. Set to null to signify that "now" is selected. Displayed time is updated in realtime when set to null
 * @param {function} props.onTimeChange       Called with new timestamp when time input changes
 * @param {function} props.onDateChange       Called with new timestamp when date input changes
 * @param {'arrival'|'departure'} props.departureOrArrival   Determine if input is set to choose departure or arrival time
 * @param {function} props.onNowClick         Called when "depart now" button is clicked
 * @param {function} props.onDepartureClick   Called when "departure" button is clicked
 * @param {function} props.onArrivalClick     Called when "arrival" button is clicked
 * @param {node} props.embedWhenClosed        JSX element to render in the corner when input is closed
 * @param {node} props.embedWhenOpen          JSX element to render when input is open
 * @param {string} props.lang                 Language selection
 * @param {number} props.serviceTimeRange           Determine number of days shown in timepicker. Optional. default is 30.
 *
 *
 * @example
 * <Datetimepicker
 *   timestamp={1590133823000}
 *   onTimeChange={(newTimestamp) => update(newTimestamp)}
 *   onDateChange={(newTimestamp) => update(newTimestamp)}
 *   departureOrArrival={'departure'}
 *   onNowClick={() => setTimestampToNull()}
 *   onDepartureClick={() => departureClicked()}
 *   onArrivalClick={() => arrivalClicked()}
 *   embedWhenClosed={<button />}
 *   lang={'en'}
 *   serviceTimeRange={15}
 * />
 */
function Datetimepicker({
  timestamp,
  onTimeChange,
  onDateChange,
  departureOrArrival,
  onNowClick,
  onDepartureClick,
  onArrivalClick,
  embedWhenClosed,
  embedWhenOpen,
  lang,
  color,
  timeZone,
  onModalSubmit,
  fontWeights,
  serviceTimeRange,
}) {
  moment.tz.setDefault(timeZone);
  const [isOpen, changeOpen] = useState(false);
  const [displayTimestamp, changeDisplayTimestamp] = useState(
    timestamp || moment().valueOf(),
  );
  // timer for updating displayTimestamp in real time
  const [timerId, setTimer] = useState(null);
  // for input labels
  const [htmlId] = useState(uniqueId('datetimepicker-'));
  const [useMobileInputs] = useState(isMobile() && dateTimeInputIsSupported());
  const openPickerRef = useRef();
  const inputRef = useRef();
  const alertRef = useRef();

  const translationSettings = { lng: lang };

  useEffect(() => {
    Object.keys(translations).forEach(language =>
      i18next.addResourceBundle(language, 'translation', translations[lang]),
    );
  }, []);

  useEffect(() => {
    moment.locale(lang);
  }, [lang]);

  const nowSelected = timestamp === null;
  useEffect(() => {
    if (nowSelected) {
      changeDisplayTimestamp(moment().valueOf());
    } else {
      // clear timer
      if (timerId) {
        clearInterval(timerId);
        setTimer(null);
      }
      changeDisplayTimestamp(timestamp);
    }
  }, [timestamp]);

  // set timer to update displayTimestamp when minute changes if nowSelected
  useEffect(() => {
    if (!nowSelected) {
      return undefined;
    }
    if (timerId) {
      clearInterval(timerId);
    }
    const newId = setInterval(() => {
      const now = moment().valueOf();
      const sameMinute = moment(displayTimestamp).isSame(now, 'minute');
      if (!sameMinute) {
        clearInterval(newId);
        setTimer(null);
        changeDisplayTimestamp(now);
      }
    }, 5000);
    setTimer(newId);
    return () => clearInterval(newId);
  }, [displayTimestamp]);

  const prevIsOpenRef = useRef();
  useEffect(() => {
    prevIsOpenRef.current = isOpen;
  });
  const prevIsOpen = prevIsOpenRef.current;

  useLayoutEffect(() => {
    if (!prevIsOpen === isOpen) {
      if (isOpen) {
        if (inputRef) {
          inputRef.current?.focus();
        }
      } else if (openPickerRef) {
        openPickerRef.current?.focus();
      }
    }
  });

  // param date is timestamp
  const getDateDisplay = date => {
    const time = moment(date);
    let formatted;
    if (time.isSame(moment(), 'day')) {
      formatted = i18next.t('today', translationSettings);
    } else if (time.isSame(moment().add(1, 'day'), 'day')) {
      formatted = i18next.t('tomorrow', translationSettings);
    } else {
      formatted = time.format('dd D.M.');
    }
    formatted = `${formatted.charAt(0).toUpperCase()}${formatted.slice(1)}`;
    return formatted;
  };

  // param time is timestamp
  const getTimeDisplay = time => {
    return moment(time).format('HH:mm');
  };

  const validateTime = (inputValue, currentTimestamp) => {
    const trimmed = inputValue.trim();
    if (trimmed.match(/^[0-9]{1,2}(\.|:)[0-9]{2}$/) !== null) {
      const splitter = trimmed.includes('.') ? '.' : ':';
      const values = trimmed.split(splitter);
      const hours = Number(values[0]);
      const hoursValid = !Number.isNaN(hours) && hours >= 0 && hours <= 23;
      const minutes = Number(values[1]);
      const minutesValid =
        !Number.isNaN(minutes) && minutes >= 0 && minutes <= 59;
      if (!minutesValid || !hoursValid) {
        return null;
      }
      const newStamp = moment(currentTimestamp)
        .hours(hours)
        .minutes(minutes)
        .valueOf();
      return newStamp;
    }
    return null;
  };

  const selectedMoment = moment(displayTimestamp);
  const timeSelectStartTime = moment(displayTimestamp).startOf('day').valueOf();
  let timeChoices = [];
  const current = moment(timeSelectStartTime);
  while (current.isSame(timeSelectStartTime, 'day')) {
    timeChoices.push(current.valueOf());
    current.add(15, 'minutes');
  }
  if (timestamp === null) {
    // if time is set to now
    // add times in 5 min intervals for next 30 mins
    const fiveMinutes = 1000 * 60 * 5;
    const nextFiveMin = Math.ceil(displayTimestamp / fiveMinutes) * fiveMinutes;
    const timesToAdd = Array(7)
      .fill()
      .map((_, i) => nextFiveMin + i * fiveMinutes);
    const closestIndexAfter = timeChoices
      .map(t => displayTimestamp - t)
      .findIndex(t => t <= 0);
    timeChoices.splice(closestIndexAfter, 0, ...timesToAdd);
    timeChoices = Array.from(new Set(timeChoices)); // remove duplicates
  }

  const dateSelectStartTime = moment()
    .startOf('day')
    .hour(selectedMoment.hour())
    .minute(selectedMoment.minute())
    .valueOf();
  const dateChoices = Array(serviceTimeRange)
    .fill()
    .map((_, i) => moment(dateSelectStartTime).add(i, 'day').valueOf());

  function showScreenreaderCloseAlert() {
    if (alertRef.current) {
      alertRef.current.innerHTML = i18next.t(
        'accessible-closed',
        translationSettings,
      );
      setTimeout(() => {
        alertRef.current.innerHTML = null;
      }, 100);
    }
  }

  function showScreenreaderOpenAlert() {
    if (alertRef.current) {
      alertRef.current.innerHTML = i18next.t(
        'accessible-opened',
        translationSettings,
      );
      setTimeout(() => {
        alertRef.current.innerHTML = null;
      }, 100);
    }
  }

  function renderOpen() {
    if (useMobileInputs) {
      return (
        isOpen && (
          <MobilePickerModal
            departureOrArrival={departureOrArrival}
            onNowClick={() => {
              changeOpen(false);
              showScreenreaderCloseAlert();
              onNowClick();
            }}
            lang={lang}
            color={color}
            onSubmit={(newTimestamp, newDepartureOrArrival) => {
              onModalSubmit(newTimestamp, newDepartureOrArrival);
              changeOpen(false);
              showScreenreaderCloseAlert();
            }}
            onCancel={() => {
              changeOpen(false);
              showScreenreaderCloseAlert();
            }}
            getTimeDisplay={getTimeDisplay}
            timeZone={timeZone}
            timestamp={displayTimestamp}
            getDateDisplay={getDateDisplay}
            dateSelectItemCount={serviceTimeRange}
            getDisplay={getTimeDisplay}
            validateTime={validateTime}
            fontWeights={fontWeights}
          />
        )
      );
    }

    return (
      <>
        <div
          className={`${styles['datetimepicker-open-container']} ${
            !isOpen ? styles.hidden : ''
          }`}
        >
          <div
            className={
              isOpen
                ? `${styles['top-row-container']} datetimepicker-top-row`
                : `${styles.hidden} datetimepicker-top-row`
            }
          >
            {' '}
            <span role="alert" className={styles['sr-only']} ref={alertRef} />
            <span />
            {/* This empty span prevents a weird focus bug on chrome */}
            <span className={styles['departure-or-arrival-container']}>
              <label
                htmlFor={`${htmlId}-departure`}
                className={`${styles['radio-textbutton-label']}
                ${
                  styles[
                    departureOrArrival === 'departure' ? 'active' : undefined
                  ]
                }`}
              >
                {i18next.t('departure', translationSettings)}
                <input
                  id={`${htmlId}-departure`}
                  name="departureOrArrival"
                  type="radio"
                  value="departure"
                  className={styles['radio-textbutton']}
                  onChange={() => {
                    onDepartureClick();
                  }}
                  checked={departureOrArrival === 'departure'}
                />
              </label>
              <label
                htmlFor={`${htmlId}-arrival`}
                className={`${styles['radio-textbutton-label']}
                ${
                  styles[
                    departureOrArrival === 'arrival' ? 'active' : undefined
                  ]
                }`}
              >
                {i18next.t('arrival', translationSettings)}
                <input
                  id={`${htmlId}-arrival`}
                  name="departureOrArrival"
                  type="radio"
                  value="arrival"
                  className={styles['radio-textbutton']}
                  onChange={() => {
                    onArrivalClick();
                  }}
                  checked={departureOrArrival === 'arrival'}
                />
              </label>
            </span>
            <button
              id={`${htmlId}-now`}
              type="button"
              className={styles['departure-now-button']}
              onClick={() => {
                changeOpen(false);
                showScreenreaderCloseAlert();
                onNowClick();
              }}
              ref={inputRef}
            >
              {i18next.t('departure-now', translationSettings)}
            </button>
            <span className={styles['right-edge']}>
              <button
                type="button"
                className={styles['close-button']}
                aria-controls={`${htmlId}-root`}
                aria-expanded="true"
                onClick={() => {
                  changeOpen(false);
                  showScreenreaderCloseAlert();
                }}
              >
                <span className={styles['close-icon']}>
                  <Icon img="close" color={color} />
                </span>
                <span className={styles['sr-only']}>
                  {i18next.t('accessible-close', translationSettings)}
                </span>
              </button>
            </span>
          </div>
          <div
            className={
              isOpen
                ? `${styles['picker-container']}`
                : `${styles.hidden} datetimepicker-top-row`
            }
          >
            <>
              <span className={styles['combobox-left']}>
                <DesktopDatetimepicker
                  value={displayTimestamp}
                  onChange={newValue => {
                    onDateChange(newValue);
                  }}
                  getDisplay={getDateDisplay}
                  timeChoices={dateChoices}
                  validate={() => null}
                  icon={
                    <span
                      className={`${styles['combobox-icon']} ${styles['date-input-icon']}`}
                    >
                      <Icon img="calendar" color={color} />
                    </span>
                  }
                  id={`${htmlId}-date`}
                  label={i18next.t('date', translationSettings)}
                  disableTyping
                  timeZone={timeZone}
                />
              </span>
              <span className={styles['combobox-right']}>
                <DesktopDatetimepicker
                  value={displayTimestamp}
                  onChange={newValue => {
                    onTimeChange(newValue);
                  }}
                  getDisplay={getTimeDisplay}
                  timeChoices={timeChoices}
                  validate={validateTime}
                  icon={
                    <span
                      className={`${styles['combobox-icon']} ${styles['time-input-icon']}`}
                    >
                      <Icon img="time" color={color} />
                    </span>
                  }
                  id={`${htmlId}-time`}
                  label={i18next.t('time', translationSettings)}
                  timeZone={timeZone}
                />
              </span>
            </>
          </div>
        </div>
        <span className={isOpen ? '' : styles.hidden}>{embedWhenOpen}</span>
        <div className={isOpen ? 'datetimepicker-bottom-row-open' : ''} />
      </>
    );
  }

  return (
    <fieldset
      className={styles['dt-datetimepicker']}
      id={`${htmlId}-root`}
      style={{
        '--color': `${color}`,
        '--font-weight-medium': fontWeights.medium,
      }}
    >
      <legend className={styles['sr-only']}>
        {i18next.t('accessible-title', translationSettings)}
      </legend>
      <span className="sr-only">
        {i18next.t('accessible-update-instructions', translationSettings)}
      </span>
      <>
        <div
          className={
            !isOpen
              ? `${styles['top-row-container']} ${styles.closed} datetimepicker-top-row`
              : `${styles.hidden} datetimepicker-top-row`
          }
        >
          <label className={styles['label-open']} htmlFor={`${htmlId}-open`}>
            <span className={styles['time-icon']}>
              <Icon img="time" color={color} />
            </span>
            <span className={styles['sr-only']}>
              {i18next.t('accessible-open', translationSettings)}
            </span>
            <span role="alert" className={styles['sr-only']} ref={alertRef} />
            <button
              id={`${htmlId}-open`}
              type="button"
              className={`${styles.textbutton} ${styles.active} ${styles['open-button']}`}
              aria-controls={`${htmlId}-root`}
              aria-expanded="false"
              onClick={() => {
                changeOpen(true);
                showScreenreaderOpenAlert();
              }}
              ref={openPickerRef}
            >
              <span>
                {nowSelected && departureOrArrival === 'departure' ? (
                  i18next.t('departure-now', translationSettings)
                ) : (
                  <>
                    {i18next.t(
                      departureOrArrival === 'departure'
                        ? 'departure'
                        : 'arrival',
                      translationSettings,
                    )}
                    {` ${
                      moment().isSame(moment(displayTimestamp), 'day')
                        ? ''
                        : getDateDisplay(displayTimestamp)
                    } ${getTimeDisplay(displayTimestamp)}`}
                  </>
                )}
              </span>
              <span className={styles['dropdown-icon']}>
                <Icon img="arrow-dropdown" color={color} />
              </span>
            </button>
          </label>
          <span className={styles['right-edge']}>{embedWhenClosed}</span>
        </div>
        <div />
      </>
      {renderOpen()}
    </fieldset>
  );
}

Datetimepicker.propTypes = {
  timestamp: PropTypes.number,
  timeZone: PropTypes.string,
  onTimeChange: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired,
  departureOrArrival: PropTypes.oneOf(['departure', 'arrival']).isRequired,
  onNowClick: PropTypes.func.isRequired,
  onDepartureClick: PropTypes.func.isRequired,
  onArrivalClick: PropTypes.func.isRequired,
  embedWhenClosed: PropTypes.node,
  embedWhenOpen: PropTypes.node,
  lang: PropTypes.string.isRequired,
  color: PropTypes.string,
  onModalSubmit: PropTypes.func.isRequired,
  fontWeights: PropTypes.shape({
    medium: PropTypes.number.isRequired,
  }).isRequired,
  serviceTimeRange: PropTypes.number,
};

Datetimepicker.defaultProps = {
  timestamp: null,
  embedWhenClosed: null,
  embedWhenOpen: null,
  color: '#007ac9',
  timeZone: 'Europe/Helsinki',
  serviceTimeRange: 30,
};

export default Datetimepicker;
