import React, { PropTypes } from 'react';
import moment from 'moment';
import { intlShape } from 'react-intl';
import TimePicker from 'material-ui/TimePicker';
import Icon from './Icon';

import ComponentUsageExample from './ComponentUsageExample';
import supportsInputType from '../util/supportsInputType';

export default function TimeSelectors(
  { arriveBy, time, dates, setArriveBy, changeTime, changeTimeMui, changeDate }, { intl },
) {
  return (
    <div className="time-selectors">
      <div className="select-wrapper">
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
        <Icon className="fake-select-arrow" img="icon-icon_arrow-dropdown" />
      </div>
      <div className="select-wrapper">
        <select
          className="date"
          value={time.format('YYYY-MM-DD')}
          onChange={changeDate}
        >
          {dates}
        </select>
        <Icon className="fake-select-arrow" img="icon-icon_arrow-dropdown" />
      </div>
      {supportsInputType('time') ?
        <div className="select-wrapper">
          <input
            type="time"
            className="time-selector"
            value={time.format('HH:mm')}
            onChange={changeTime}
          />
          <Icon className="fake-select-arrow" img="icon-icon_arrow-dropdown" />
        </div> :
        <div className="select-wrapper">
          <TimePicker
            format="24hr"
            className="time-selector time-mui"
            defaultTime={time.toDate()}
            value={time.toDate()}
            onChange={changeTimeMui}
            style={{
              display: 'inline-block',
            }}
          />
          <Icon className="fake-select-arrow" img="icon-icon_arrow-dropdown" />
        </div>}
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

TimeSelectors.displayName = 'TimeSelectors';

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
        changeTimeMui={() => {}}
        changeDate={() => {}}
        dates={[<option value={'2016-05-18'} key={'2016-05-18'} >Today</option>]}
      />
    </ComponentUsageExample>
  </div>);
