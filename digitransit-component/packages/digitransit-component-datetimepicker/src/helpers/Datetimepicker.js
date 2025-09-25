import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DateTime, Settings } from 'luxon';
import uniqueId from 'lodash/uniqueId';
import i18next from 'i18next';
import Icon from '@digitransit-component/digitransit-component-icon';
import DesktopDatetimepicker from './DesktopDatetimepicker';
import translations from './translations';
import styles from './styles.scss';
import { isMobile } from './mobileDetection';
import dateTimeInputIsSupported from './dateTimeInputIsSupported';
import MobilePickerModal from './MobilePickerModal';

Object.keys(translations).forEach(l =>
  i18next.addResourceBundle(l, 'translation', translations[l], true),
);

Settings.defaultLocale = 'en';

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
 * @param {function} props.onOpen                   Determine what to do when timepicker is open. Optional. no default implementation.
 * @param {function} props.onClose                  Determine what to do when timepicker is closed. Optional. no default implementation.
 * @param {function} props.openPicker               Determine if timepicker should be open in intial render. Optional. Default is undefined.
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
  onOpen,
  onClose,
  openPicker,
}) {
  Settings.defaultZone = timeZone;
  const [isOpen, changeOpen] = useState(openPicker || false);
  const [displayTimestamp, changeDisplayTimestamp] = useState(
    timestamp || DateTime.now().toMillis(),
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
    Settings.defaultLocale = lang;
  }, [lang]);

  const nowSelected = timestamp === null;
  useEffect(() => {
    if (nowSelected) {
      changeDisplayTimestamp(DateTime.now().toMillis());
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
      const now = DateTime.now();
      const sameMinute = DateTime.fromMillis(displayTimestamp).hasSame(
        now,
        'minute',
      );
      if (!sameMinute) {
        clearInterval(newId);
        setTimer(null);
        changeDisplayTimestamp(now.toMillis());
      }
    }, 5000);
    setTimer(newId);
    return () => clearInterval(newId);
  }, [displayTimestamp]);

  /**
   * @param {number} date Date in milliseconds since unix epoch
   * @returns {string} formatted date
   */
  const getDateDisplay = date => {
    const time = DateTime.fromMillis(date);
    const now = DateTime.now();
    let formatted;
    if (time.hasSame(now, 'day')) {
      formatted = i18next.t('today', translationSettings);
      formatted = `${formatted.charAt(0).toUpperCase()}${formatted.slice(1)}`;
    } else if (time.hasSame(now.plus({ days: 1 }), 'day')) {
      formatted = i18next.t('tomorrow', translationSettings);
      formatted = `${formatted.charAt(0).toUpperCase()}${formatted.slice(1)}`;
    } else {
      formatted = time.toFormat('ccc d.L.');
    }
    return formatted;
  };

  // param time is timestamp
  const getTimeDisplay = time => {
    return DateTime.fromMillis(time).toFormat('HH:mm');
  };

  // compute choices only when timestamp changes instead of every render
  const [timeChoices, dateChoices] = useMemo(() => {
    const selectedMoment = DateTime.fromMillis(
      timestamp || DateTime.now().toMillis(),
    );
    const timeSelectStartTime = selectedMoment.startOf('day').toMillis();
    const isMobileCurrently = isMobile();
    let newTimeChoices = [];
    let current = selectedMoment.startOf('day');
    while (current.hasSame(timeSelectStartTime, 'day')) {
      newTimeChoices.push(current.valueOf());
      if (isMobileCurrently) {
        current = current.plus({ minutes: 15 });
      } else {
        current = current.plus({ minutes: 1 });
      }
    }
    if (timestamp === null) {
      // if time is set to now
      // add times in 5 min intervals for next 30 mins
      const fiveMinutes = 1000 * 60 * 5;
      const nextFiveMin =
        Math.ceil(displayTimestamp / fiveMinutes) * fiveMinutes;
      const timesToAdd = Array(7)
        .fill()
        .map((_, i) => nextFiveMin + i * fiveMinutes);
      const closestIndexAfter = newTimeChoices
        .map(t => displayTimestamp - t)
        .findIndex(t => t <= 0);
      newTimeChoices.splice(closestIndexAfter, 0, ...timesToAdd);
      newTimeChoices = Array.from(new Set(newTimeChoices)); // remove duplicates
    }
    const dateSelectStartTime = DateTime.now().startOf('day').set({
      hour: selectedMoment.hour,
      minute: selectedMoment.minute,
    });
    const newDateChoices = Array(serviceTimeRange)
      .fill()
      .map((_, i) => dateSelectStartTime.plus({ days: i }).toMillis());
    return [newTimeChoices, newDateChoices];
  }, [timestamp]);

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

  const handleClose = () => {
    changeOpen(false);
    showScreenreaderCloseAlert();
    if (onClose) {
      onClose();
    }
  };

  const handleNowClick = () => {
    handleClose();
    onNowClick();
  };

  function renderOpen() {
    if (useMobileInputs) {
      return (
        isOpen && (
          <MobilePickerModal
            departureOrArrival={departureOrArrival}
            onNowClick={handleNowClick}
            lang={lang}
            color={color}
            onSubmit={(newTimestamp, newDepartureOrArrival) => {
              onModalSubmit(newTimestamp, newDepartureOrArrival);
              changeOpen(false);
              showScreenreaderCloseAlert();
            }}
            onCancel={handleClose}
            onAfterClose={() =>
              requestAnimationFrame(() => {
                openPickerRef.current?.focus();
              })
            }
            getTimeDisplay={getTimeDisplay}
            timeZone={timeZone}
            timestamp={displayTimestamp}
            getDateDisplay={getDateDisplay}
            dateSelectItemCount={serviceTimeRange}
            getDisplay={getTimeDisplay}
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
              onClick={handleNowClick}
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
                onClick={handleClose}
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
                datePicker
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
                translationSettings={translationSettings}
              />
            </span>
          </div>
        </div>
        <span className={isOpen ? '' : styles.hidden}>{embedWhenOpen}</span>
        <div className={isOpen ? 'datetimepicker-bottom-row-open' : ''} />
      </>
    );
  }

  const formatToprowSummary = () => {
    if (nowSelected && departureOrArrival === 'departure') {
      return <span>{i18next.t('departure-now', translationSettings)}</span>;
    }
    const dateDisplay = getDateDisplay(displayTimestamp);
    const timeDisplay = getTimeDisplay(displayTimestamp);
    const summary = i18next.t(
      departureOrArrival === 'departure' ? 'departure' : 'arrival',
      translationSettings,
    );
    const isToday = DateTime.now().hasSame(
      DateTime.fromMillis(displayTimestamp),
      'day',
    );
    const isTomorrow = DateTime.now()
      .plus({ days: 1 })
      .hasSame(DateTime.fromMillis(displayTimestamp), 'day');
    if (isToday) {
      return <span>{`${summary} ${timeDisplay}`}</span>;
    }
    if (isTomorrow) {
      return (
        <span>{`${summary} ${dateDisplay.toLowerCase()} ${timeDisplay}`}</span>
      );
    }
    return <span>{`${summary} ${dateDisplay} ${timeDisplay}`}</span>;
  };

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
      <span className={styles['sr-only']}>
        {i18next.t('accessible-update-instructions', translationSettings)}
      </span>
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
              if (onOpen) {
                onOpen();
              }
            }}
            ref={openPickerRef}
          >
            {formatToprowSummary()}
            <span className={styles['dropdown-icon']}>
              <Icon img="arrow-dropdown" color={color} />
            </span>
          </button>
        </label>
        <span className={styles['right-edge']}>{embedWhenClosed}</span>
      </div>
      <div />
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
  serviceTimeRange: PropTypes.number.isRequired,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  openPicker: PropTypes.bool,
};

Datetimepicker.defaultProps = {
  timestamp: null,
  embedWhenClosed: null,
  embedWhenOpen: null,
  color: '#007ac9',
  timeZone: 'Europe/Helsinki',
  onOpen: null,
  onClose: null,
  openPicker: undefined,
};

export default Datetimepicker;
