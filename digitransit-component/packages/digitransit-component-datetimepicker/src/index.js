import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import debounce from 'lodash/debounce';
import Datetimepicker from './helpers/Datetimepicker';

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
 *
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
}) {
  moment.locale(lang);
  moment.tz.setDefault(timeZone);
  const initialNow = realtime ? null : moment().valueOf();
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
      changeTimestampState(moment().valueOf());
      onTimeChange(
        Math.round(moment().valueOf() / 1000),
        departureOrArrival === 'arrival',
      );
      return;
    }
    changeTimestampState(newTime);
    onTimeChange(Math.round(newTime / 1000), departureOrArrival === 'arrival');
  }, 10);

  const dateChanged = debounce(newDate => {
    if (newDate === null) {
      changeTimestampState(moment().valueOf());
      onDateChange(
        Math.round(moment().valueOf() / 1000),
        departureOrArrival === 'arrival',
      );
      return;
    }
    changeTimestampState(newDate);
    onDateChange(Math.round(newDate / 1000), departureOrArrival === 'arrival');
  }, 10);

  const nowClicked = () => {
    changeDepartureOrArrival('departure');
    const newTimestamp = realtime ? null : moment().valueOf();
    changeTimestampState(newTimestamp);
    onNowClick(Math.round(newTimestamp / 1000));
  };

  const departureClicked = () => {
    let changed = false;
    let newTime = timestamp;
    if (timestamp === null) {
      const now = moment().valueOf();
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
      const now = moment().valueOf();
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
    onTimeChange(time / 1000, mode === 'arrival');
  };

  return (
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
    />
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
};

export default DatetimepickerStateContainer;
