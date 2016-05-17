import React, { PropTypes } from 'react';
import moment from 'moment';
import ComponentUsageExample from '../documentation/ComponentUsageExample';

export default function TimeSelectors(
  { arriveBy, time, dates, setArriveBy, changeTime }, { intl }
) {
  return (
    <div className="time-selectors">
      <select className="arrive" ref="arriveBy" value={arriveBy} onChange={setArriveBy}>
        <option value="false">
          {intl.formatMessage({
            id: 'leaving-at',
            defaultMessage: 'Leaving at',
          })}
        </option>
        <option value="true">
          {intl.formatMessage({
            id: 'arriving-at',
            defaultMessage: 'Arriving at',
          })}
        </option>
      </select>
      <select
        className="date"
        ref="date"
        value={time.format('YYYY-MM-DD')}
        onChange={changeTime}
      >
        {dates}
      </select>
      <input
        type="time"
        ref="time"
        className="time"
        value={time.format('HH:mm')}
        onChange={changeTime}
      />
    </div>
  );
}

TimeSelectors.propTypes = {
  arriveBy: PropTypes.bool.isRequired,
  time: PropTypes.instanceOf(moment).isRequired,
  setArriveBy: PropTypes.func.isRequired,
  changeTime: PropTypes.func.isRequired,
  dates: PropTypes.arrayOf(PropTypes.element).isRequired,
};

TimeSelectors.description = (
  <div>
    <p>
      A toolbar for changing arriveBy/departAt, date and time
    </p>
    <ComponentUsageExample>
      <TimeSelectors
        arriveBy={false}
        time={moment('2016-05-18 09:30')}
        setArriveBy={() => {}}
        changeTime={() => {}}
        dates={[<option value={'2016-05-18'} key={'2016-05-18'} >Today</option>]}
      />
    </ComponentUsageExample>
  </div>);
