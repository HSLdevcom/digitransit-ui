import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import { intlShape } from 'react-intl';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import ItineraryTimePicker from './ItineraryTimePicker';

export default function TimeSelectors(
  { arriveBy, time, dates, setArriveBy, changeTime, changeDate }, { intl },
) {
  // const timeInputClass = `select-wrapper ${isMobile ? '' : 'time-box-shadow'}`;
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
      <ItineraryTimePicker initHours={time.format('HH')} initMin={time.format('mm')} changeTime={changeTime} />
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
