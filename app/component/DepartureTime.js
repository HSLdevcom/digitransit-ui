import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { intlShape } from 'react-intl';
import { configShape } from '../util/shapes';
import { timeStr } from '../util/timeUtils';
import Icon from './Icon';

export default function DepartureTime(props, context) {
  let shownTime;
  const timeDiffInMinutes = Math.floor(
    (props.departureTime - props.currentTime) / 60,
  );
  if (timeDiffInMinutes <= -1) {
    shownTime = undefined;
  } else if (timeDiffInMinutes <= context.config.minutesToDepartureLimit) {
    shownTime = context.intl.formatMessage(
      { id: 'departure-time-in-minutes', defaultMessage: '{minutes} min' },
      { minutes: timeDiffInMinutes },
    );
  }

  return (
    <React.Fragment>
      {!props.isNextDeparture && (
        <>
          <span className="sr-only">
            {shownTime
              ? context.intl.formatMessage(
                  {
                    id: 'stop-departure-time-future',
                    defaultMessage: 'Departure time is in {minutes} minutes',
                  },
                  { minutes: timeDiffInMinutes },
                )
              : context.intl.formatMessage({
                  id: 'stop-departure-time-past',
                  defaultMessage: 'Departure time was at',
                })}
          </span>
          <span
            className={cx(
              'time',
              {
                realtime: props.realtime,
                canceled: props.canceled,
              },
              props.className,
            )}
            aria-hidden
          >
            {shownTime}
          </span>
          {props.realtime && (
            <span className="sr-only">
              {context.intl.formatMessage({
                id: 'realtime',
                defaultMessage: 'Realtime',
              })}
            </span>
          )}
        </>
      )}
      <span
        className={cx(
          'time',
          {
            realtime: props.realtime,
            canceled: props.canceled,
            first: !props.isNextDeparture,
            next: props.isNextDeparture,
          },
          props.className,
        )}
      >
        {props.isNextDeparture &&
          `${context.intl.formatMessage({
            id: 'next',
            defaultMessage: 'Next',
          })} `}
        {timeStr(props.departureTime * 1000)}
      </span>
      {props.canceled && props.showCancelationIcon && (
        <Icon className="caution" img="icon-icon_caution" />
      )}
    </React.Fragment>
  );
}

DepartureTime.contextTypes = {
  intl: intlShape.isRequired, // eslint-disable-line react/no-typos
  config: configShape.isRequired,
};

DepartureTime.displayName = 'DepartureTime';

DepartureTime.propTypes = {
  className: PropTypes.string,
  canceled: PropTypes.bool,
  currentTime: PropTypes.number.isRequired,
  departureTime: PropTypes.number.isRequired,
  realtime: PropTypes.bool,
  showCancelationIcon: PropTypes.bool,
  isNextDeparture: PropTypes.bool,
};

DepartureTime.defaultProps = {
  className: '',
  canceled: false,
  realtime: false,
  showCancelationIcon: false,
  isNextDeparture: false,
};

DepartureTime.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired, // eslint-disable-line react/no-typos
};

/**
 * maps stoptime to data structure required by DepartureTime. This is copied
 * from departure-list-container.
 *
 *  @param stoptime stoptime from graphql
 *  @param pattern pattern from graphql
 */

export const mapStopTime = (stoptime, pattern) => ({
  stop: stoptime.stop,
  canceled: stoptime.realtimeState === 'CANCELED',
  departureTime:
    stoptime.serviceDay +
    (stoptime.realtimeState === 'CANCELED' || stoptime.realtimeDeparture === -1
      ? stoptime.scheduledDeparture
      : stoptime.realtimeDeparture),
  realtime: stoptime.realtimeDeparture !== -1 && stoptime.realtime,
  pattern: pattern && pattern.pattern,
  trip: stoptime.trip,
});

/**
 * maps stoptime to DepartureTime component
 *  @param stoptime stoptime from graphql
 *  @param currentTime
 *  @param showCancelationIcon whether an icon should be shown if the departure is canceled.
 *  @param isNextDeparture whether a string "Next" should rendered instead of departure time in minutes
 */
export const fromStopTime = (
  stoptime,
  currentTime,
  showCancelationIcon = true,
  isNextDeparture = false,
) => (
  <DepartureTime
    currentTime={currentTime}
    {...mapStopTime(stoptime)}
    showCancelationIcon={showCancelationIcon}
    isNextDeparture={isNextDeparture}
  />
);
