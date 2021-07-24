import cx from 'classnames';
import moment from 'moment';
import React from 'react';
import PropTypes from 'prop-types';
import { legHasCancelation } from '../util/alertUtils';

function DelayedTime({ leg, delay, startTime }, { config }) {
  const realTime = leg !== undefined && leg.realTime;
  const isLate =
    delay !== undefined && delay >= config.itinerary.delayThreshold;
  const tooEarly = delay !== undefined && delay < 0;
  const originalTime = realTime &&
    (isLate || tooEarly) && [
      <br key="br" />,
      <span key="time" className="original-time">
        {moment(startTime).subtract(delay, 's').format('HH:mm')}
      </span>,
    ];

  return (
    <>
      <span className={cx({ realtime: realTime, late: isLate })}>
        <span className={cx({ canceled: legHasCancelation(leg) })}>
          {moment(startTime).format('HH:mm')}
        </span>
      </span>
      {originalTime}
    </>
  );
}

DelayedTime.propTypes = {
  leg: PropTypes.shape({
    realTime: PropTypes.bool.isRequired,
  }),
  delay: PropTypes.number,
  startTime: PropTypes.number.isRequired,
};

DelayedTime.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default DelayedTime;
