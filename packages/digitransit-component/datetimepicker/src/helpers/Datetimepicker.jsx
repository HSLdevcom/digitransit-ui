import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import { DateTime } from 'luxon';
import uniqueId from 'lodash/uniqueId';
import { useTranslation } from 'react-i18next';
import Icon from '@digitransit-component/digitransit-component-icon';
import DesktopPickerInputs from './DesktopPickerInputs';
import styles from './styles.scss';
import { isMobile } from './mobileDetection';
import dateTimeInputIsSupported from './dateTimeInputIsSupported';
import MobilePickerModal from './MobilePickerModal';
import { getDateDisplay, getTimeDisplay } from './utils';

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
 * @param {boolean} props.showUpdateInstructions    Add a hidden instruction that changing the time triggers a new search. Optional. Default is false.
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
export default function Datetimepicker({
  timestamp = null,
  onTimeChange,
  onDateChange,
  departureOrArrival,
  onNowClick,
  onDepartureClick,
  onArrivalClick,
  embedWhenClosed,
  embedWhenOpen,
  lang,
  color = '#007ac9',
  onModalSubmit,
  serviceTimeRange,
  onOpen,
  onClose,
  openPicker,
  showUpdateInstructions = false,
}) {
  const [t] = useTranslation(undefined, { lng: lang });
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
  const closePickerRef = useRef();
  const inputRef = useRef();
  const alertRef = useRef();
  // Control to focus after the next open/close render
  const pendingFocusRef = useRef(null);

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
      const sameMinute = DateTime.fromMillis(displayTimestamp).hasSame(now, 'minute');
      if (!sameMinute) {
        clearInterval(newId);
        setTimer(null);
        changeDisplayTimestamp(now.toMillis());
      }
    }, 5000);
    setTimer(newId);
    return () => clearInterval(newId);
  }, [displayTimestamp]);

  function showScreenreaderCloseAlert() {
    if (alertRef.current) {
      alertRef.current.innerHTML = t('accessible-closed');
      setTimeout(() => {
        // The component may have unmounted (clearing the ref) before this
        // fires - don't crash in that case.
        if (alertRef.current) {
          alertRef.current.innerHTML = null;
        }
      }, 100);
    }
  }

  function showScreenreaderOpenAlert() {
    if (alertRef.current) {
      alertRef.current.innerHTML = t('accessible-opened');
      setTimeout(() => {
        // The component may have unmounted (clearing the ref) before this
        // fires - don't crash in that case.
        if (alertRef.current) {
          alertRef.current.innerHTML = null;
        }
      }, 100);
    }
  }

  // The toggled control is hidden when the picker opens or closes, so move
  // focus explicitly. The mobile modal manages its own focus.
  useEffect(() => {
    const target = pendingFocusRef.current;
    pendingFocusRef.current = null;
    if (useMobileInputs || !target) {
      return;
    }
    (target === 'close' ? closePickerRef : openPickerRef).current?.focus();
  }, [isOpen]);

  const handleClose = () => {
    pendingFocusRef.current = 'open';
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
            timestamp={displayTimestamp}
            dateSelectItemCount={serviceTimeRange}
          />
        )
      );
    }
    return (
      <>
        <div
          className={`${styles['datetimepicker-open-container']} ${!isOpen ? styles.hidden : ''}`}
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
            {/* First in DOM order so it is the first stop after opening; shown at the right edge via CSS order */}
            <span className={`${styles['right-edge']} ${styles['close-edge']}`}>
              <button
                type="button"
                className={styles['close-button']}
                aria-controls={`${htmlId}-root`}
                aria-expanded="true"
                onClick={handleClose}
                ref={closePickerRef}
              >
                <span className={styles['close-icon']}>
                  <Icon img="close" color={color} />
                </span>
                <span className={styles['sr-only']}>{t('accessible-close')}</span>
              </button>
            </span>
            <span className={styles['departure-or-arrival-container']}>
              <label
                htmlFor={`${htmlId}-departure`}
                className={`${styles['radio-textbutton-label']}
                ${styles[departureOrArrival === 'departure' ? 'active' : undefined]}`}
              >
                {t('departure')}
                <input
                  id={`${htmlId}-departure`}
                  name={`${htmlId}-departureOrArrival`}
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
                ${styles[departureOrArrival === 'arrival' ? 'active' : undefined]}`}
              >
                {t('arrival')}
                <input
                  id={`${htmlId}-arrival`}
                  name={`${htmlId}-departureOrArrival`}
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
              aria-describedby={`${htmlId}-now-description`}
            >
              {t('departure-now')}
            </button>
            <span id={`${htmlId}-now-description`} className={styles['sr-only']}>
              {t('accessible-departure-now')}
            </span>
          </div>
          <DesktopPickerInputs
            timestamp={timestamp}
            displayTimestamp={displayTimestamp}
            serviceTimeRange={serviceTimeRange}
            onDateChange={onDateChange}
            onTimeChange={onTimeChange}
            htmlId={htmlId}
            color={color}
            lang={lang}
            isOpen={isOpen}
          />
        </div>
        <span className={isOpen ? '' : styles.hidden}>{embedWhenOpen}</span>
      </>
    );
  }

  const getSummaryText = () => {
    if (nowSelected && departureOrArrival === 'departure') {
      return t('departure-now');
    }
    const dateDisplay = getDateDisplay(displayTimestamp, t);
    const timeDisplay = getTimeDisplay(displayTimestamp);
    const summary = t(departureOrArrival === 'departure' ? 'departure' : 'arrival');
    const isToday = DateTime.now().hasSame(DateTime.fromMillis(displayTimestamp), 'day');
    const isTomorrow = DateTime.now()
      .plus({ days: 1 })
      .hasSame(DateTime.fromMillis(displayTimestamp), 'day');
    if (isToday) {
      return `${summary} ${timeDisplay}`;
    }
    if (isTomorrow) {
      return `${summary} ${dateDisplay.toLowerCase()} ${timeDisplay}`;
    }
    return `${summary} ${dateDisplay} ${timeDisplay}`;
  };

  const summaryText = getSummaryText();

  return (
    <fieldset
      className={styles['dt-datetimepicker']}
      id={`${htmlId}-root`}
      style={{ '--color': `${color}` }}
    >
      <legend className={styles['sr-only']}>{t('accessible-title')}</legend>
      {showUpdateInstructions && (
        <span className={styles['sr-only']}>{t('accessible-update-instructions')}</span>
      )}
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
          <span role="alert" className={styles['sr-only']} ref={alertRef} />
          <button
            id={`${htmlId}-open`}
            type="button"
            className={`${styles.textbutton} ${styles.active} ${styles['open-button']}`}
            aria-controls={`${htmlId}-root`}
            aria-expanded="false"
            // Name starts with the visible text (WCAG 2.5.3) and exposes the selected time
            aria-label={`${summaryText}. ${t('accessible-open')}`}
            onClick={() => {
              pendingFocusRef.current = 'close';
              changeOpen(true);
              showScreenreaderOpenAlert();
              if (onOpen) {
                onOpen();
              }
            }}
            ref={openPickerRef}
          >
            {summaryText}
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
  serviceTimeRange: PropTypes.number.isRequired,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  openPicker: PropTypes.bool,
  showUpdateInstructions: PropTypes.bool,
};
