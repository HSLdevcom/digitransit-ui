import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { intlShape, FormattedMessage } from 'react-intl';
import { matchShape, routerShape } from 'found';
import uniqueId from 'lodash/uniqueId';
import ComponentUsageExample from './ComponentUsageExample';
import DesktopDatepicker from './DesktopDatepicker';
import DesktopTimepicker from './DesktopTimepicker';
import { replaceQueryParams } from '../util/queryUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';

function getInitialTimestamp(match) {
  return match.location.query.time
    ? moment(Number(match.location.query.time) * 1000).valueOf()
    : moment().valueOf();
}

function getInitialUseNow(match) {
  return !match.location.query.time;
}

function getInitialDepartureOrArrival(match) {
  return match.location.query.arriveBy ? 'arrival' : 'departure';
}

function Datetimepicker({ realtime }, context) {
  const { router, match } = context;

  const [isOpen, changeOpen] = useState(false);
  const [timestamp, changeTimestamp] = useState(getInitialTimestamp(match));
  const [nowSelected, changeNow] = useState(getInitialUseNow(match));
  const [departureOrArrival, changeDepartureOrArrival] = useState(
    getInitialDepartureOrArrival(match),
  );
  // for tracking realtime
  const [timerId, setTimer] = useState(null);
  // for input labels
  const [htmlId] = useState(uniqueId('datetimepicker-'));

  const changeTimeParam = newTime => {
    if (!newTime) {
      replaceQueryParams(router, match, {
        time: undefined,
      });
    } else {
      const seconds = Math.round(newTime / 1000);
      replaceQueryParams(router, match, {
        time: seconds,
      });
    }
  };

  // param date is timestamp
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

  const getTimeDisplay = time => {
    return moment(time).format('HH:mm');
  };
  // update url params when state changes
  useEffect(
    () => {
      if (!nowSelected) {
        changeTimeParam(timestamp);
      }
    },
    [timestamp],
  );
  useEffect(
    () => {
      if (nowSelected) {
        changeTimeParam(undefined);
      }
    },
    [nowSelected],
  );

  useEffect(
    () => {
      if (departureOrArrival === 'arrival') {
        replaceQueryParams(router, match, {
          arriveBy: true,
        });
      } else {
        replaceQueryParams(router, match, {
          arriveBy: undefined,
        });
      }
    },
    [departureOrArrival],
  );

  useEffect(
    function setRealtimeClock() {
      if (!realtime) {
        return undefined;
      }
      if (nowSelected) {
        // TODO ensure there aren't multiple timers running
        const newId = setInterval(() => {
          const minuteChanged = !moment(timestamp).isSame(moment(), 'minute');
          if (minuteChanged) {
            changeTimestamp(moment().valueOf());
          }
        }, 5000);
        setTimer(newId);
        return () => clearInterval(newId);
      }
      clearInterval(timerId);
      return undefined;
    },
    [nowSelected],
  );

  // TODO combine these later if they have no difference
  const onDateChange = newValue => {
    changeNow(false);
    changeTimestamp(newValue);
    addAnalyticsEvent({
      action: 'EditJourneyDate',
      category: 'ItinerarySettings',
      name: null,
    });
  };
  const onTimeChange = newValue => {
    changeNow(false);
    changeTimestamp(newValue);
    addAnalyticsEvent({
      action: 'EditJourneyTime',
      category: 'ItinerarySettings',
      name: null,
    });
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
                  {`${getDateDisplay(timestamp)} ${getTimeDisplay(timestamp)}`}
                </>
              )}
            </button>
          </label>
        </div>
      ) : (
        <>
          <div className="top-row-container">
            <button
              type="button"
              className={cx('textbutton', nowSelected ? 'active' : '')}
              onClick={() => {
                if (realtime) {
                  changeNow(true);
                }
                changeDepartureOrArrival('departure');
                changeTimestamp(moment().valueOf());
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
                  if (departureOrArrival !== 'departure') {
                    changeDepartureOrArrival('departure');
                    addAnalyticsEvent({
                      event: 'sendMatomoEvent',
                      category: 'ItinerarySettings',
                      action: 'LeavingArrivingSelection',
                      name: 'SelectLeaving',
                    });
                  }
                }}
                checked={departureOrArrival === 'departure'}
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
                  if (departureOrArrival !== 'arrival') {
                    changeDepartureOrArrival('arrival');
                    changeNow(false);
                    addAnalyticsEvent({
                      event: 'sendMatomoEvent',
                      category: 'ItinerarySettings',
                      action: 'LeavingArrivingSelection',
                      name: 'SelectArriving',
                    });
                  }
                }}
                checked={departureOrArrival === 'arrival'}
              />
            </label>
            <button
              type="button"
              className="close-button"
              onClick={() => changeOpen(false)}
            >
              X
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
                <span>
                  <DesktopDatepicker
                    value={timestamp}
                    onChange={onDateChange}
                    getDisplay={getDateDisplay}
                  />
                </span>
                <span>
                  <DesktopTimepicker
                    value={timestamp}
                    onChange={onTimeChange}
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
  realtime: PropTypes.bool.isRequired,
};

Datetimepicker.contextTypes = {
  intl: intlShape.isRequired,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
  config: PropTypes.object.isRequired,
};

Datetimepicker.description = <ComponentUsageExample />;

export { Datetimepicker as default, Datetimepicker as Component };
