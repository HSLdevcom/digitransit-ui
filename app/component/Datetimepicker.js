import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { intlShape, FormattedMessage } from 'react-intl';
import uniqueId from 'lodash/uniqueId';
import ComponentUsageExample from './ComponentUsageExample';
import DesktopDatetimepicker from './DesktopDatetimepicker';
import Icon from './Icon';

function Datetimepicker(
  {
    timestamp,
    onTimeChange,
    onDateChange,
    departureOrArrival,
    onNowClick,
    onDepartureClick,
    onArrivalClick,
    embedWhenClosed,
  },
  context,
) {
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
        changeDisplayTimestamp(timestamp);
        if (timerId) {
          clearInterval(timerId);
          setTimer(null);
        }
        return undefined;
      }
      if (nowSelected) {
        changeDisplayTimestamp(moment().valueOf());
        // TODO ensure there aren't multiple timers running
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

  // param date should be timestamp
  const getDateDisplay = date => {
    const time = moment(date);
    if (time.isSame(moment(), 'day')) {
      return context.intl.formatMessage({ id: 'today' });
    }
    if (time.isSame(moment().add(1, 'day'), 'day')) {
      return context.intl.formatMessage({ id: 'tomorrow' });
    }
    // TODO should date be internationalized?
    return time.format('dd D.M.');
  };

  // param time is timestamp
  const getTimeDisplay = time => {
    return moment(time).format('HH:mm');
  };

  const validateDate = value => {
    if (value.match(/[0-9]{1,2}\.[0-9]{1,2}\./) !== null) {
      // TODO check NaN
      const values = value.split('.');
      const date = Number(values[0]);
      // TODO check that numbers are in range
      const month = Number(values[1]);
      const newStamp = moment(displayTimestamp)
        .month(month - 1) // moment month is 0-indexed
        .date(date);
      return newStamp;
    }
    return false;
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
  // TODO accessible opening
  return (
    <fieldset className="dt-datetimepicker" id={`${htmlId}-root`}>
      <legend className="sr-only">
        <FormattedMessage id="datetimepicker.accessible-title" />
      </legend>
      {!isOpen ? (
        <>
          <div className="top-row-container">
            <span className="time-icon">
              <Icon img="icon-icon_time" viewBox="0 0 16 16" />
            </span>
            <label htmlFor={`${htmlId}-open`}>
              <span className="sr-only">
                <FormattedMessage id="datetimepicker.accessible-open" />
              </span>
              <button
                id={`${htmlId}-open`}
                type="button"
                className="textbutton active"
                aria-controls={`${htmlId}-root`}
                aria-expanded="false"
                onClick={() => changeOpen(true)}
              >
                {nowSelected && departureOrArrival === 'departure' ? (
                  <FormattedMessage id="datetimepicker.departure-now" />
                ) : (
                  <>
                    <FormattedMessage
                      id={
                        departureOrArrival === 'departure'
                          ? 'datetimepicker.departure'
                          : 'datetimepicker.arrival'
                      }
                    />
                    {` ${getDateDisplay(displayTimestamp)} ${getTimeDisplay(
                      displayTimestamp,
                    )}`}
                  </>
                )}
                <span className="dropdown-icon">
                  <Icon img="icon-icon_arrow-dropdown" />
                </span>
              </button>
            </label>
            <span className="right-edge">{embedWhenClosed}</span>
          </div>
          <div />
        </>
      ) : (
        <>
          <div className="top-row-container">
            <span className="time-icon">
              <Icon img="icon-icon_time" viewBox="0 0 16 16" />
            </span>
            <label
              htmlFor={`${htmlId}-now`}
              className={cx(
                'radio-textbutton-label',
                'first-radio',
                departureOrArrival === 'departure' && nowSelected
                  ? 'active'
                  : undefined,
              )}
            >
              <FormattedMessage id="datetimepicker.departure-now" />
              <input
                id={`${htmlId}-now`}
                name="departureOrArrival"
                type="radio"
                className="radio-textbutton"
                onChange={() => {
                  onNowClick();
                }}
                checked={nowSelected && departureOrArrival === 'departure'}
              />
            </label>
            <label
              htmlFor={`${htmlId}-departure`}
              className={cx(
                'radio-textbutton-label',
                departureOrArrival === 'departure' && !nowSelected
                  ? 'active'
                  : undefined,
              )}
            >
              <FormattedMessage id="datetimepicker.departure" />
              <input
                id={`${htmlId}-departure`}
                name="departureOrArrival"
                type="radio"
                className="radio-textbutton"
                onChange={() => {
                  onDepartureClick();
                }}
                checked={!nowSelected && departureOrArrival === 'departure'}
              />
            </label>
            <label
              htmlFor={`${htmlId}-arrival`}
              className={cx(
                'radio-textbutton-label',
                departureOrArrival === 'arrival' ? 'active' : undefined,
              )}
            >
              <FormattedMessage id="datetimepicker.arrival" />
              <input
                id={`${htmlId}-arrival`}
                name="departureOrArrival"
                type="radio"
                className="radio-textbutton"
                onChange={() => {
                  onArrivalClick();
                }}
                checked={departureOrArrival === 'arrival'}
              />
            </label>
            <span className="right-edge">
              <button
                type="button"
                className="close-button"
                aria-controls={`${htmlId}-root`}
                aria-expanded="true"
                onClick={() => changeOpen(false)}
              >
                <span className="close-icon">
                  <Icon img="icon-icon_plus" />
                </span>
                <span className="sr-only">
                  <FormattedMessage id="datetimepicker.accessible-close" />
                </span>
              </button>
            </span>
          </div>
          <div className="picker-container">
            {isMobile ? (
              'TODO mobile view'
            ) : (
              <>
                <span className="combobox-left">
                  <DesktopDatetimepicker
                    value={displayTimestamp}
                    onChange={newValue => {
                      onDateChange(newValue);
                    }}
                    getDisplay={getDateDisplay}
                    itemCount={dateSelectItemCount}
                    itemDiff={dateSelectItemDiff}
                    startTime={dateSelectStartTime}
                    validate={validateDate}
                    icon={
                      <span className="combobox-icon date-input-icon">
                        <Icon img="icon-icon_calendar" viewBox="0 0 20 18" />
                      </span>
                    }
                    id={`${htmlId}-date`}
                    labelMessageId="datetimepicker.date"
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
                      <span className="combobox-icon time-input-icon">
                        <Icon img="icon-icon_time" viewBox="0 0 16 16" />
                      </span>
                    }
                    id={`${htmlId}-time`}
                    labelMessageId="datetimepicker.time"
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
  timestamp: PropTypes.number, // timestamp in milliseconds, null to update in realtime
  onTimeChange: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired,
  departureOrArrival: PropTypes.oneOf(['departure', 'arrival']).isRequired,
  onNowClick: PropTypes.func.isRequired,
  onDepartureClick: PropTypes.func.isRequired,
  onArrivalClick: PropTypes.func.isRequired,
  embedWhenClosed: PropTypes.node,
};

Datetimepicker.defaultProps = { timestamp: null, embedWhenClosed: null };

Datetimepicker.contextTypes = {
  intl: intlShape.isRequired,
};

Datetimepicker.description = <ComponentUsageExample />; // TODO

export { Datetimepicker as default, Datetimepicker as Component };
