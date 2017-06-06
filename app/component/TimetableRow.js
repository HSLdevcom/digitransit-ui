import React, { PropTypes } from 'react';
import moment from 'moment';
import cx from 'classnames';

const LONG_LINE_NAME = 5;

const TimetableRow = ({ title, stoptimes }) => (
  <div>
    <div className="timetable-row">
      <h1 className="title bold">{title}:</h1>
      {stoptimes.sort((time1, time2) =>
        (time1.scheduledDeparture - time2.scheduledDeparture),
        ).map(time => (
          <span
            key={(time.name) + time.scheduledDeparture}
            className={cx({ 'overflow-fade': time.name && time.name.length > LONG_LINE_NAME })}
          >
            {time.name !== '995' ? // Placeholder
              <div>
                <span className="bold">{moment.unix(time.serviceDay + time.scheduledDeparture).format('mm')}</span>
                <span className="line-name" title={(time.name)}>/{(time.name)}</span>
              </div>
            : <div />
            }
          </span>
      ))}
    </div>
  </div>
);

TimetableRow.propTypes = {
  title: PropTypes.string.isRequired,
  stoptimes: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    serviceDay: PropTypes.number.isRequired,
    scheduledDeparture: PropTypes.number.isRequired,
  })).isRequired,
};

export default TimetableRow;
