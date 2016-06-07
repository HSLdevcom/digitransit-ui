import React, { PropTypes } from 'react';
import moment from 'moment';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import { intlShape } from 'react-intl';
import supportsInputType from '../../util/supportsInputType';
import TimePicker from 'material-ui/TimePicker';

export default function TimeSelectors(
  { arriveBy, time, dates, setArriveBy, changeTime, changeTimeMui, changeDate }, { intl }
) {
  return (
    <div className="time-selectors">
      <select className="arrive" value={arriveBy} onChange={setArriveBy}>
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
        value={time.format('YYYY-MM-DD')}
        onChange={changeDate}
      >
        {dates}
      </select>
      {supportsInputType('time') ?
        <input
          type="time"
          className="time"
          value={time.format('HH:mm')}
          onChange={changeTime}
        /> :
        <TimePicker
          format="24hr"
          className="time"
          defaultTime={time.toDate()}
          value={time.toDate()}
          onChange={changeTimeMui}
          style={{
            display: 'inline-block',
          }}
        />}
    </div>
  );
}

TimeSelectors.propTypes = {
  arriveBy: PropTypes.bool.isRequired,
  time: PropTypes.instanceOf(moment).isRequired,
  setArriveBy: PropTypes.func.isRequired,
  changeTime: PropTypes.func.isRequired,
  changeTimeMui: PropTypes.func.isRequired,
  changeDate: PropTypes.func.isRequired,
  dates: PropTypes.arrayOf(PropTypes.element).isRequired,
};

TimeSelectors.contextTypes = {
  intl: intlShape.isRequired,
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
        changeDate={() => {}}
        dates={[<option value={'2016-05-18'} key={'2016-05-18'} >Today</option>]}
      />
    </ComponentUsageExample>
  </div>);
