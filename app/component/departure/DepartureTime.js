import React from 'react';
import cx from 'classnames';
import Icon from '../icon/icon';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import moment from 'moment';
import { intlShape, FormattedMessage } from 'react-intl';
import {
  currentTime as exampleCurrentTime,
  departure as exampleDeparture,
  realtimeDeparture as exampleRealtimeDeparture,
} from '../documentation/ExampleData';


function DepartureTime(props, context) {
  let realtime;
  if (props.realtime && !props.canceled) {
    realtime = <Icon img="icon-icon_realtime" className="realtime-icon realtime" />;
  }

  let canceled;
  if (props.canceled) {
    canceled = <Icon img="icon-icon_caution" className="icon cancelation-info" />;
  }

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
      {canceled}
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
