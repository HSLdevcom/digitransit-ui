import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { intlShape, FormattedMessage } from 'react-intl';
import uniqueId from 'lodash/uniqueId';
import ComponentUsageExample from './ComponentUsageExample';
import DesktopDatepicker from './DesktopDatepicker';
import DesktopTimepicker from './DesktopTimepicker';
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

  const isMobile = false; // TODO
  // TODO accessible opening
  return (
    <fieldset className="dt-datetimepicker">
      <legend className="sr-only">
        <FormattedMessage id="datetimepicker.accessible-title" />
      </legend>
      {!isOpen ? (
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
            </button>
            <span className="dropdown-icon">
              <Icon img="icon-icon_arrow-dropdown" />
            </span>
          </label>
        </div>
      ) : (
        <>
          <div className="top-row-container">
            <span className="time-icon">
              <Icon img="icon-icon_time" viewBox="0 0 16 16" />
            </span>
            <button
              type="button"
              className={cx('textbutton', nowSelected ? 'active' : '')}
              onClick={() => {
                onNowClick();
              }}
            >
              <FormattedMessage id="datetimepicker.departure-now" />
            </button>
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
            <button
              type="button"
              className="close-button"
              onClick={() => changeOpen(false)}
            >
              <span className="close-icon">
                <Icon img="icon-icon_plus" />
              </span>
              <span className="sr-only">
                <FormattedMessage id="datetimepicker.accessible-close" />
              </span>
            </button>
          </div>
          <div className="picker-container">
            {isMobile ? (
              'TODO mobile view'
            ) : (
              <>
                <span className="combobox-left">
                  <DesktopDatepicker
                    value={displayTimestamp}
                    onChange={newValue => {
                      onDateChange(newValue);
                    }}
                    getDisplay={getDateDisplay}
                  />
                </span>
                <span>
                  <DesktopTimepicker
                    value={displayTimestamp}
                    onChange={newValue => {
                      onTimeChange(newValue);
                    }}
                    getDisplay={getTimeDisplay}
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
};

Datetimepicker.defaultProps = { timestamp: null };

Datetimepicker.contextTypes = {
  intl: intlShape.isRequired,
};

Datetimepicker.description = <ComponentUsageExample />; // TODO

export { Datetimepicker as default, Datetimepicker as Component };
