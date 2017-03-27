import React, { PropTypes } from 'react';
import moment from 'moment';
import { intlShape } from 'react-intl';
import { isMobile } from '../util/browser';

import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import supportsInputType from '../util/supportsInputType';
import TimeInput from './TimeInput';
import CustomInputTime from './CustomInputTime';

export default function TimeSelectors(
  { arriveBy, time, dates, setArriveBy, changeTime, changeDate }, { intl },
) {
  return (
    <div className="time-selectors">
      <div className="select-wrapper">
        <select className="arrive" value={arriveBy} onChange={setArriveBy}>
          <option value="false">
            {intl.formatMessage({
              id: 'leaving-at',
              defaultMessage: 'Leaving',
            })}
          </option>
          <option value="true">
            {intl.formatMessage({
              id: 'arriving-at',
              defaultMessage: 'Arriving',
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
        <div id="time" className="select-wrapper">
          <CustomInputTime
            time={time.format('HH:mm')}
            changeTime={changeTime}
          />
          {isMobile &&
            <Icon className="fake-select-arrow" img="icon-icon_arrow-dropdown" key="caret" />
          }
        </div> :
        <div className="select-wrapper">
          <TimeInput value={time.format('HH:mm')} changeTime={changeTime} />
        </div>}
    </div>
  );
}

TimeSelectors.propTypes = {
  arriveBy: PropTypes.bool.isRequired,
  time: PropTypes.instanceOf(moment).isRequired,
  setArriveBy: PropTypes.func.isRequired,
  changeTime: PropTypes.func.isRequired,
  changeDate: PropTypes.func.isRequired,
  dates: PropTypes.arrayOf(PropTypes.element).isRequired,
};

TimeSelectors.contextTypes = {
  intl: intlShape.isRequired,
};

TimeSelectors.displayName = 'TimeSelectors';

TimeSelectors.description = () =>
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
  </div>;
