import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import uniqueId from 'lodash/uniqueId';
import i18next from 'i18next';
import Icon from '@digitransit-component/digitransit-component-icon';
import DesktopDatetimepicker from './helpers/DesktopDatetimepicker';
import translations from './helpers/translations';
import styles from './helpers/styles.scss';

i18next.init({ lng: 'fi', resources: {} });
i18next.addResourceBundle('en', 'translation', translations.en);
i18next.addResourceBundle('fi', 'translation', translations.fi);
i18next.addResourceBundle('sv', 'translation', translations.sv);

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
 *
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
}) {
  const [isOpen, changeOpen] = useState(false);
  const [displayTimestamp, changeDisplayTimestamp] = useState(timestamp);
  // timer for updating displayTimestamp in real time
  const [timerId, setTimer] = useState(null);
  // for input labels
  const [htmlId] = useState(uniqueId('datetimepicker-'));

  const nowSelected = timestamp === null;

  // update displayTimestamp in real time if timestamp === null
  useEffect(
    () => {
      if (!nowSelected) {
        // clear timer
        changeDisplayTimestamp(timestamp);
        if (timerId) {
          clearInterval(timerId);
          setTimer(null);
        }
        return undefined;
      }
      if (nowSelected) {
        // set new timer
        changeDisplayTimestamp(moment().valueOf());
        if (timerId) {
          clearInterval(timerId);
        }
        const newId = setInterval(() => {
          const minuteChanged = !moment(displayTimestamp).isSame(
            moment(),
            'minute',
          );
          if (minuteChanged) {
            changeDisplayTimestamp(moment().valueOf());
          }
        }, 5000);
        setTimer(newId);
        return () => clearInterval(newId);
      }
      return undefined;
    },
    [timestamp],
  );

  // param date is timestamp
  const getDateDisplay = date => {
    const time = moment(date);
    if (time.isSame(moment(), 'day')) {
      return i18next.t('today');
    }
    if (time.isSame(moment().add(1, 'day'), 'day')) {
      return i18next.t('tomorrow');
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
  const timeSelectStartTime = moment(displayTimestamp)
    .startOf('day')
    .valueOf();
  const dateSelectItemCount = 30;
  const dateSelectItemDiff = 1000 * 60 * 60 * 24; // 24 hrs in ms
  const dateSelectStartTime = moment()
    .startOf('day')
    .hour(selectedMoment.hour())
    .minute(selectedMoment.minute())
    .valueOf();

  const isMobile = false; // TODO
  return (
    <fieldset className={styles['dt-datetimepicker']} id={`${htmlId}-root`}>
      <legend className={styles['sr-only']}>
        {i18next.t('accessible-title')}
      </legend>
      {!isOpen ? (
        <>
          <div className={styles['top-row-container']}>
            <span className={styles['time-icon']}>
              <Icon img="time" />
            </span>
            <label htmlFor={`${htmlId}-open`}>
              <span className={styles['sr-only']}>
                {i18next.t('accessible-open')}
              </span>
              <button
                id={`${htmlId}-open`}
                type="button"
                className={`${styles.textbutton} ${styles.active}`}
                aria-controls={`${htmlId}-root`}
                aria-expanded="false"
                onClick={() => changeOpen(true)}
              >
                {nowSelected && departureOrArrival === 'departure' ? (
                  i18next.t('departure-now')
                ) : (
                  <>
                    {i18next.t(
                      departureOrArrival === 'departure'
                        ? 'departure'
                        : 'arrival',
                    )}
                    {` ${getDateDisplay(
                      displayTimestamp,
                    ).toLowerCase()} ${getTimeDisplay(displayTimestamp)}`}
                  </>
                )}
                <span className={styles['dropdown-icon']}>
                  <Icon img="arrow-dropdown" />
                </span>
              </button>
            </label>
            <span className={styles['right-edge']}>{embedWhenClosed}</span>
          </div>
          <div />
        </>
      ) : (
        <>
          <div className={styles['top-row-container']}>
            <span className={styles['time-icon']}>
              <Icon img="time" />
            </span>
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
              {i18next.t('departure-now')}
              <input
                id={`${htmlId}-now`}
                name="departureOrArrival"
                type="radio"
                className={styles['radio-textbutton']}
                onChange={() => {
                  onNowClick();
                }}
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
              {i18next.t('departure')}
              <input
                id={`${htmlId}-departure`}
                name="departureOrArrival"
                type="radio"
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
              {i18next.t('arrival')}
              <input
                id={`${htmlId}-arrival`}
                name="departureOrArrival"
                type="radio"
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
                  <Icon img="plus" />
                </span>
                <span className={styles['sr-only']}>
                  {i18next.t('accessible-close')}
                </span>
              </button>
            </span>
          </div>
          <div className={styles['picker-container']}>
            {isMobile ? (
              'TODO mobile view'
            ) : (
              <>
                <span className={styles['combobox-left']}>
                  <DesktopDatetimepicker
                    value={displayTimestamp}
                    onChange={newValue => {
                      onDateChange(newValue);
                    }}
                    getDisplay={getDateDisplay}
                    itemCount={dateSelectItemCount}
                    itemDiff={dateSelectItemDiff}
                    startTime={dateSelectStartTime}
                    validate={() => null}
                    icon={
                      <span
                        className={`${styles['combobox-icon']} ${
                          styles['date-input-icon']
                        }`}
                      >
                        <Icon img="calendar" />
                      </span>
                    }
                    id={`${htmlId}-date`}
                    label={i18next.t('date')}
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
                    itemCount={timeSelectItemCount}
                    itemDiff={timeSelectItemDiff}
                    startTime={timeSelectStartTime}
                    validate={validateTime}
                    icon={
                      <span
                        className={`${styles['combobox-icon']} ${
                          styles['time-input-icon']
                        }`}
                      >
                        <Icon img="time" />
                      </span>
                    }
                    id={`${htmlId}-time`}
                    label={i18next.t('time')}
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
};

Datetimepicker.defaultProps = { timestamp: null, embedWhenClosed: null };

export default Datetimepicker;
