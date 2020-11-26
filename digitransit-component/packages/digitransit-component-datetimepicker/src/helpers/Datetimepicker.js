import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import 'moment/locale/fi';
import uniqueId from 'lodash/uniqueId';
import i18next from 'i18next';
import Icon from '@digitransit-component/digitransit-component-icon';
import DesktopDatetimepicker from './DesktopDatetimepicker';
import MobileDatepicker from './MobileDatepicker';
import MobileTimepicker from './MobileTimepicker';
import translations from './translations';
import styles from './styles.scss';
import { isMobile, isAndroid } from './mobileDetection';
import dateTimeInputIsSupported from './dateTimeInputIsSupported';

moment.tz.setDefault('Europe/Helsinki');
moment.locale('en');
i18next.init({ lng: 'en', resources: {} });
Object.keys(translations).forEach(lang =>
  i18next.addResourceBundle(lang, 'translation', translations[lang]),
);

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
 * @param {string} props.lang                 Language selection
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
  lang,
  color,
}) {
  const [isOpen, changeOpen] = useState(false);
  const [displayTimestamp, changeDisplayTimestamp] = useState(
    timestamp || moment().valueOf(),
  );
  // timer for updating displayTimestamp in real time
  const [timerId, setTimer] = useState(null);
  // for input labels
  const [htmlId] = useState(uniqueId('datetimepicker-'));

  const [useMobileInputs] = useState(isMobile() && dateTimeInputIsSupported());
  const useDateTimeCombined = isAndroid();

  const translationSettings = { lng: lang };

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

  // param date is timestamp
  const getDateDisplay = date => {
    const time = moment(date);
    if (time.isSame(moment(), 'day')) {
      return i18next.t('today', translationSettings);
    }
    if (time.isSame(moment().add(1, 'day'), 'day')) {
      return i18next.t('tomorrow', translationSettings);
    }
    return time.format('dd D.M.');
  };

  // param time is timestamp
  const getTimeDisplay = time => {
    return moment(time).format('HH:mm');
  };

  const validateTime = value => {
    const trimmed = value.trim();
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
      const newStamp = moment(displayTimestamp)
        .hours(hours)
        .minutes(minutes)
        .valueOf();
      return newStamp;
    }
    return null;
  };

  const selectedMoment = moment(displayTimestamp);
  const timeSelectItemCount = 24 * 4;
  const timeSelectItemDiff = 1000 * 60 * 15; // 15 minutes in ms
  const timeSelectStartTime = moment(displayTimestamp).startOf('day').valueOf();
  let timeChoices = Array(timeSelectItemCount)
    .fill()
    .map((_, i) => timeSelectStartTime + i * timeSelectItemDiff);
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

  const dateSelectItemCount = 30;
  const dateSelectItemDiff = 1000 * 60 * 60 * 24; // 24 hrs in ms
  const dateSelectStartTime = moment()
    .startOf('day')
    .hour(selectedMoment.hour())
    .minute(selectedMoment.minute())
    .valueOf();
  const dateChoices = Array(dateSelectItemCount)
    .fill()
    .map((_, i) => dateSelectStartTime + i * dateSelectItemDiff);

  return (
    <fieldset
      className={styles['dt-datetimepicker']}
      id={`${htmlId}-root`}
      style={{ '--color': `${color}` }}
    >
      <legend className={styles['sr-only']}>
        {i18next.t('accessible-title', translationSettings)}
      </legend>
      {!isOpen ? (
        <>
          <div
            className={`${styles['top-row-container']} datetimepicker-top-row`}
          >
            <label className={styles['label-open']} htmlFor={`${htmlId}-open`}>
              <span className={styles['time-icon']}>
                <Icon img="time" color={color} />
              </span>
              <span className={styles['sr-only']}>
                {i18next.t('accessible-open', translationSettings)}
              </span>
              <button
                id={`${htmlId}-open`}
                type="button"
                className={`${styles.textbutton} ${styles.active} ${styles['open-button']}`}
                aria-controls={`${htmlId}-root`}
                aria-expanded="false"
                onClick={() => changeOpen(true)}
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
                          : getDateDisplay(displayTimestamp).toLowerCase()
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
      ) : (
        <>
          <div
            className={`${styles['top-row-container']} datetimepicker-top-row`}
          >
            <span />
            {/* This empty span prevents a weird focus bug on chrome */}
            <label
              htmlFor={`${htmlId}-now`}
              className={`${styles['radio-textbutton-label']} ${
                styles['first-radio']
              } ${
                styles[
                  departureOrArrival === 'departure' && nowSelected
                    ? 'active'
                    : undefined
                ]
              }`}
            >
              <span className={styles['time-icon']}>
                <Icon img="time" color={color} />
              </span>
              <span className={styles['now-text']}>
                {i18next.t('departure-now', translationSettings)}
              </span>
              <input
                id={`${htmlId}-now`}
                name="departureOrArrival"
                type="radio"
                value="now"
                className={styles['radio-textbutton']}
                onChange={() => onNowClick()}
                checked={nowSelected && departureOrArrival === 'departure'}
              />
            </label>
            <label
              htmlFor={`${htmlId}-departure`}
              className={`${styles['radio-textbutton-label']}
                ${
                  styles[
                    departureOrArrival === 'departure' && !nowSelected
                      ? 'active'
                      : undefined
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
                checked={!nowSelected && departureOrArrival === 'departure'}
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
            <span className={styles['right-edge']}>
              <button
                type="button"
                className={styles['close-button']}
                aria-controls={`${htmlId}-root`}
                aria-expanded="true"
                onClick={() => changeOpen(false)}
              >
                <span className={styles['close-icon']}>
                  <Icon img="plus" color={color} />
                </span>
                <span className={styles['sr-only']}>
                  {i18next.t('accessible-close', translationSettings)}
                </span>
              </button>
            </span>
          </div>
          <div
            className={`${styles['picker-container']} datetimepicker-bottom-row-open`}
          >
            {useMobileInputs ? (
              <>
                <span
                  className={`${styles['combobox-left']} ${styles['combobox-mobile-container']}`}
                >
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
                    dateTimeCombined={useDateTimeCombined}
                  />
                </span>
                <span
                  className={`${styles['combobox-right']} ${styles['combobox-mobile-container']}`}
                >
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
                    dateTimeCombined={useDateTimeCombined}
                  />
                </span>
              </>
            ) : (
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
                  />
                </span>
                <span>
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
                  />
                </span>
              </>
            )}
          </div>
        </>
      )}
    </fieldset>
  );
}

Datetimepicker.propTypes = {
  timestamp: PropTypes.number,
  onTimeChange: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired,
  departureOrArrival: PropTypes.oneOf(['departure', 'arrival']).isRequired,
  onNowClick: PropTypes.func.isRequired,
  onDepartureClick: PropTypes.func.isRequired,
  onArrivalClick: PropTypes.func.isRequired,
  embedWhenClosed: PropTypes.node,
  lang: PropTypes.string.isRequired,
  color: PropTypes.string,
};

Datetimepicker.defaultProps = {
  timestamp: null,
  embedWhenClosed: null,
  color: '#007ac9',
};

export default Datetimepicker;
