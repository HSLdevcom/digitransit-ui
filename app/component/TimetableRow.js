import React, { PropTypes } from 'react';
import moment from 'moment';

const TimetableRow = ({ title, stoptimes }) => (
  <div className="timetable-row">
    <h1 className="title bold">{title}:</h1>
    {stoptimes.sort((time1, time2) =>
      (time1.scheduledDeparture - time2.scheduledDeparture),
      ).map(time => (
        <span key={time.shortName + time.scheduledDeparture}>
          <span className="bold">{moment.unix(time.serviceDay + time.scheduledDeparture).format('mm')}</span>
          <span>/{time.shortName} </span>
        </span>
    ))}
  </div>
);

TimetableRow.propTypes = {
  title: PropTypes.string.isRequired,
  stoptimes: PropTypes.arrayOf(PropTypes.shape({
    shortName: PropTypes.string.isRequired,
    serviceDay: PropTypes.number.isRequired,
    scheduledDeparture: PropTypes.number.isRequired,
  })).isRequired,
};

export default TimetableRow;
