import React from 'react';
import cx from 'classnames';
import moment from 'moment';
import { intlShape, FormattedMessage } from 'react-intl';
import Icon from '../icon/icon';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import {
  currentTime as exampleCurrentTime,
  departure as exampleDeparture,
  realtimeDeparture as exampleRealtimeDeparture,
} from '../documentation/ExampleData';

function DepartureTime(props, context) {
  let shownTime;
  const departureTime = moment(props.departureTime * 1000);
  if (props.useUTC) {
    departureTime.utc();
  }

  const currentTime = moment(props.currentTime * 1000);
  if (departureTime.isBefore(currentTime) ||
      departureTime.isAfter(currentTime.clone().add(20, 'minutes'))) {
    shownTime = departureTime.format('HH:mm');
  } else if (currentTime.diff(departureTime, 'minutes') === 0) {
    shownTime = <FormattedMessage id="arriving-soon" defaultMessage="Now" />;
  } else {
    shownTime = `${departureTime.diff(currentTime, 'minutes')}
      ${context.intl.formatMessage({ id: 'minute-short', defaultMessage: 'min' })}`;
  }

  let realtime;
  if (props.realtime && !props.canceled) {
    realtime = <Icon img="icon-icon_realtime" className="realtime-icon realtime" />;
  }
  return (
    <span
      style={props.style}
      className={cx('time', {
        realtime: props.realtime,
        canceled: props.canceled,
      },
      props.className)}
    >
      {realtime}
      {shownTime}
    </span>);
}

DepartureTime.contextTypes = {
  intl: intlShape.isRequired,
};

DepartureTime.description = (
  <div>
    <p>
      Display time in correct format. Displays minutes for 20 minutes,
      otherwise in HH:mm format.
      Also, it takes into account if the time is realtime.
      The prop useUTC forces rendering in UTC, not local TZ, for testing.
    </p>
    <ComponentUsageExample
      description="real time"
    >
      <DepartureTime
        departureTime={exampleRealtimeDeparture.stoptime}
        realtime={exampleRealtimeDeparture.realtime}
        currentTime={exampleCurrentTime}
        useUTC
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="not real time" >
      <DepartureTime
        departureTime={exampleDeparture.stoptime}
        realtime={exampleDeparture.realtime}
        currentTime={exampleCurrentTime}
        useUTC
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="canceled" >
      <DepartureTime
        departureTime={exampleDeparture.stoptime}
        realtime={exampleDeparture.realtime}
        currentTime={exampleCurrentTime}
        canceled
        useUTC
      />
    </ComponentUsageExample>
  </div>);

DepartureTime.propTypes = {
  className: React.PropTypes.string,
  canceled: React.PropTypes.bool,
  currentTime: React.PropTypes.number.isRequired,
  departureTime: React.PropTypes.number.isRequired,
  realtime: React.PropTypes.bool,
  style: React.PropTypes.object,
  useUTC: React.PropTypes.bool,
};

export default DepartureTime;


/**
 * maps stoptime to data structure required by DepartureTime. This is copied
 * from departure-list-container.
 *
 *  @param stoptime stoptime from graphql
 *  @param pattern pattern from graphql
 */

export const mapStopTime = (stoptime, pattern) => (
  {
    stop: stoptime.stop,
    canceled: stoptime.realtimeState === 'CANCELED'
      || (typeof window !== 'undefined' && window.mock && stoptime.realtimeDeparture % 40 === 0),
    departureTime: stoptime.serviceDay +
      ((stoptime.realtimeState === 'CANCELED' || stoptime.realtimeDeparture === -1)
        ? stoptime.scheduledDeparture
        : stoptime.realtimeDeparture),
    realtime: stoptime.realtimeDeparture !== -1 && stoptime.realtime,
    pattern: pattern && pattern.pattern,
    trip: stoptime.trip,
  }
);

/**
 * maps stoptime to DepartureTime component
 *  @param stoptime stoptime from graphql
 *  @param currentTime
 */
export const fromStopTime = (stoptime, currentTime) => (
  <DepartureTime
    currentTime={currentTime} {...mapStopTime(stoptime)} style={{ whiteSpace: 'nowrap' }}
  />
);
