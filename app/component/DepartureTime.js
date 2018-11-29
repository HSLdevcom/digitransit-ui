import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import moment from 'moment';
import { intlShape, FormattedMessage } from 'react-intl';
import ComponentUsageExample from './ComponentUsageExample';
import {
  currentTime as exampleCurrentTime,
  departure as exampleDeparture,
} from './ExampleData';

function DepartureTime(props, context) {
  let shownTime;
  const timeDiffInMinutes = Math.floor(
    (props.departureTime - props.currentTime) / 60,
  );

  if (
    timeDiffInMinutes < 0 ||
    timeDiffInMinutes > context.config.minutesToDepartureLimit
  ) {
    const departureTime = moment(props.departureTime * 1000);
    if (props.useUTC) {
      departureTime.utc();
    }
    shownTime = departureTime.format('HH:mm');
  } else if (timeDiffInMinutes === 0) {
    shownTime = <FormattedMessage id="arriving-soon" defaultMessage="Now" />;
  } else {
    shownTime = (
      <FormattedMessage
        id="departure-time-in-minutes"
        defaultMessage="{minutes} min"
        values={{ minutes: timeDiffInMinutes }}
      />
    );
  }
  return (
    <span
      style={props.style}
      className={cx(
        'time',
        {
          canceled: props.canceled,
        },
        props.className,
      )}
    >
      {shownTime}
    </span>
  );
}

DepartureTime.contextTypes = {
  intl: intlShape.isRequired, // eslint-disable-line react/no-typos
};

DepartureTime.description = () => (
  <div>
    <p>
      Display time in correct format. Displays minutes for 20 minutes, otherwise
      in HH:mm format.The prop useUTC forces rendering in UTC, not local TZ, for
      testing.
    </p>
    <ComponentUsageExample description="canceled">
      <DepartureTime
        departureTime={exampleDeparture.stoptime}
        realtime={exampleDeparture.realtime}
        currentTime={exampleCurrentTime}
        canceled
        useUTC
      />
    </ComponentUsageExample>
  </div>
);

DepartureTime.displayName = 'DepartureTime';

DepartureTime.propTypes = {
  className: PropTypes.string,
  canceled: PropTypes.bool,
  currentTime: PropTypes.number.isRequired,
  departureTime: PropTypes.number.isRequired,
  style: PropTypes.object,
  useUTC: PropTypes.bool,
};

DepartureTime.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired, // eslint-disable-line react/no-typos
};

export default DepartureTime;

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
 */
export const fromStopTime = (stoptime, currentTime) => (
  <DepartureTime currentTime={currentTime} {...mapStopTime(stoptime)} />
);
