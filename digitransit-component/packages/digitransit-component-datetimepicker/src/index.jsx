import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Settings, DateTime } from 'luxon';
import debounce from 'lodash/debounce';
import Datetimepicker from './helpers/Datetimepicker';
import i18n from './helpers/i18n';

/**
 * This component renders an input to choose a date and time. Renders separate input fields for date and time selection. Values for timestamp and arriveBy correspond to Digitransit query params time and arriveBy. This component will display a native date input on mobile and a custom one for desktop. Mobile detection is done by parsing user agent.
 *
 * @alias Datetimepicker
 *
 * @param {Object} props
 *
 * @param {boolean} props.realtime                  Determine if selected time should be updated in realtime when 'now' is selected.
 * @param {Number} props.initialTimestamp           Initial value for selected time. Unix timestamp in seconds. Updating this will change timepicker value but the correct value is kept in component state even if this is not updated.
 * @param {boolean} props.initialArriveBy           Initial value for arriveBy. Determines if picker is in arrival mode (true) or departure mode (false). Correct value is kept in component state even if this is not updated. Changing this will also trigger change in the component.
 * @param {function} props.onTimeChange             Called with (time, arriveBy) when time input changes. time is number timestamp in seconds, arriveBy is boolean
 * @param {function} props.onDateChange             Called with (time, arriveBy) when date input changes. time is number timestamp in seconds, arriveBy is boolean
 * @param {function} props.onNowClick               Called when "depart now" button is clicked. time is current input value in seconds
 * @param {function} props.onDepartureClick         Called with (time) when "departure" button is clicked. time is current input value in seconds
 * @param {function} props.onArrivalClick           Called with (time) when "arrival" button is clicked. time is current input value in seconds
 * @param {node} props.embedWhenClosed              JSX element to render in the corner when input is closed
 * @param {node} props.embedWhenOpen                JSX element to render when input is open
 * @param {string} props.lang                       Language selection. Default 'en'
 * @param {number} props.serviceTimeRange           Determine number of days shown in timepicker. Optional. default is 30.
 * @param {function} props.onOpen                   Determine what to do when timepicker is open. Optional. no default implementation.
 * @param {function} props.onClose                  Determine what to do when timepicker is closed. Optional. no default implementation.
 * @param {function} props.openPicker               Determine if timepicker should be open in intial render. Optional. Default is undefined.
 * @example
 * <Datetimepicker
 *   realtime={true}
 *   initialTimestamp={1590133823}
 *   initialArriveBy={false}
 *   onTimeChange={(time, arriveBy) => changeUrl(time, arriveBy)}
 *   onDateChange={(time, arriveBy) => changeUrl(time, arriveBy)}
 *   onNowClick={(time) => changeUrl(undefined, undefined)}
 *   onDepartureClick={(time) => changeUrl(time, 'true')}
 *   onArrivalClick={(time) => changeUrl(time, undefined)}
 *   embedWhenClosed={<button />}
 *   lang={'en'}
 *   serviceTimeRange={15}
 * />
 */
function DatetimepickerStateContainer({
  realtime,
  initialArriveBy,
  initialTimestamp,
  onDepartureClick,
  onArrivalClick,
  onTimeChange,
  onDateChange,
  onNowClick,
  embedWhenClosed,
  embedWhenOpen,
  lang,
  color,
  timeZone,
  fontWeights,
  serviceTimeRange,
  onOpen,
  onClose,
  openPicker,
}) {
  Settings.defaultLocale = lang;
  Settings.defaultZone = timeZone;
  const initialNow = realtime ? null : DateTime.now().toMillis();
  const [timestamp, changeTimestampState] = useState(
    initialTimestamp ? initialTimestamp * 1000 : initialNow,
  );
  const [departureOrArrival, changeDepartureOrArrival] = useState(
    initialArriveBy === true ? 'arrival' : 'departure',
  );

  // update state if props change
  useEffect(() => {
    const bothNull = timestamp === null && initialTimestamp === undefined;
    const oneNull = timestamp === null || initialTimestamp === undefined;
    const sameTime = Math.round(timestamp / 1000) === initialTimestamp;
    const timestampChanged = !bothNull && (oneNull || !sameTime);
    if (timestampChanged) {
      if (initialTimestamp === undefined) {
        changeTimestampState(null);
      } else {
        changeTimestampState(initialTimestamp * 1000);
      }
    }
    if (!initialArriveBy === (departureOrArrival === 'arrival')) {
      changeDepartureOrArrival(
        initialArriveBy === true ? 'arrival' : 'departure',
      );
    }
  }, [initialTimestamp, initialArriveBy]);

  const timeChanged = debounce(newTime => {
    if (newTime === null) {
      changeTimestampState(DateTime.now().toMillis());
      onTimeChange(
        DateTime.now().toUnixInteger(),
        departureOrArrival === 'arrival',
      );
      return;
    }
    changeTimestampState(newTime);
    onTimeChange(Math.round(newTime / 1000), departureOrArrival === 'arrival');
  }, 10);

  const dateChanged = debounce(newDate => {
    if (newDate === null) {
      changeTimestampState(DateTime.now().toMillis());
      onDateChange(
        DateTime.now().toUnixInteger(),
        departureOrArrival === 'arrival',
      );
      return;
    }
    changeTimestampState(newDate);
    onDateChange(Math.round(newDate / 1000), departureOrArrival === 'arrival');
  }, 10);

  const nowClicked = () => {
    changeDepartureOrArrival('departure');
    const newTimestamp = realtime ? null : DateTime.now().toMillis();
    changeTimestampState(newTimestamp);
    onNowClick(Math.round(newTimestamp / 1000));
  };

  const departureClicked = () => {
    let changed = false;
    let newTime = timestamp;
    if (timestamp === null) {
      const now = DateTime.now().toMillis();
      changeTimestampState(now);
      newTime = now;
      changed = true;
    }
    if (departureOrArrival !== 'departure') {
      changeDepartureOrArrival('departure');
      changed = true;
    }
    if (changed) {
      onDepartureClick(Math.round(newTime / 1000));
    }
  };

  const arrivalClicked = () => {
    let changed = false;
    let newTime = timestamp;
    if (timestamp === null) {
      const now = DateTime.now().toMillis();
      changeTimestampState(now);
      newTime = now;
      changed = true;
    }
    if (departureOrArrival !== 'arrival') {
      changeDepartureOrArrival('arrival');
      changed = true;
    }
    if (changed) {
      onArrivalClick(Math.round(newTime / 1000));
    }
  };
  const onModalSubmit = (time, mode) => {
    changeTimestampState(time);
    changeDepartureOrArrival(mode);
    onTimeChange(Math.round(time / 1000), mode === 'arrival', true);
  };

  return (
    <I18nextProvider i18n={i18n}>
      <Datetimepicker
        timestamp={timestamp}
        onTimeChange={timeChanged}
        onDateChange={dateChanged}
        departureOrArrival={departureOrArrival}
        onNowClick={nowClicked}
        onDepartureClick={departureClicked}
        onArrivalClick={arrivalClicked}
        embedWhenClosed={embedWhenClosed}
        embedWhenOpen={embedWhenOpen}
        lang={lang}
        color={color}
        timeZone={timeZone}
        onModalSubmit={onModalSubmit}
        fontWeights={fontWeights}
        serviceTimeRange={serviceTimeRange}
        onOpen={onOpen}
        onClose={onClose}
        openPicker={openPicker}
      />
    </I18nextProvider>
  );
}

DatetimepickerStateContainer.propTypes = {
  realtime: PropTypes.bool,
  initialTimestamp: PropTypes.number,
  initialArriveBy: PropTypes.bool,
  onDepartureClick: PropTypes.func.isRequired,
  onArrivalClick: PropTypes.func.isRequired,
  onTimeChange: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired,
  onNowClick: PropTypes.func.isRequired,
  embedWhenClosed: PropTypes.node,
  embedWhenOpen: PropTypes.node,
  lang: PropTypes.string,
  color: PropTypes.string,
  timeZone: PropTypes.string,
  fontWeights: PropTypes.shape({
    medium: PropTypes.number,
  }),
  serviceTimeRange: PropTypes.number,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  openPicker: PropTypes.bool,
};

DatetimepickerStateContainer.defaultProps = {
  realtime: false,
  initialArriveBy: undefined,
  initialTimestamp: undefined,
  embedWhenClosed: null,
  embedWhenOpen: null,
  lang: 'en',
  color: '#007ac9',
  timeZone: 'Europe/Helsinki',
  fontWeights: {
    medium: 500,
  },
  onOpen: null,
  onClose: null,
  openPicker: undefined,
  serviceTimeRange: 30,
};

export default DatetimepickerStateContainer;
