import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import cx from 'classnames';

const LONG_LINE_NAME = 5;

const TimetableRow = ({ title, stoptimes, showRoutes, timerows }) => (
  <div className="timetable-row-printing">
    <div
      className="timetable-row"
      style={{
        display:
          timerows.filter(o => o === title).length === 0 &&
          showRoutes.length > 0 &&
          'none',
      }}
    >
      <h1 className="title bold">{title}:</h1>
      <div className="timetable-printable-title">{title}</div>
      <div className="timetable-rowcontainer">
        {stoptimes
          .sort(
            (time1, time2) =>
              time1.scheduledDeparture - time2.scheduledDeparture,
          )
          .map(time => (
            <div
              className="timetablerow-linetime"
              key={time.name + time.scheduledDeparture}
            >
              <span
                className={cx({
                  'overflow-fade':
                    time.name && time.name.length > LONG_LINE_NAME,
                })}
              >
                {(showRoutes.filter(o => o === time.id).length > 0 &&
                  showRoutes.length > 0) ||
                showRoutes.length === 0 ? (
                  <div
                    className={cx({
                      'overflow-fade':
                        time.name && time.name.length > LONG_LINE_NAME,
                    })}
                  >
                    <span className="bold">
                      {moment
                        .unix(time.serviceDay + time.scheduledDeparture)
                        .format('mm')}
                    </span>
                    <span className="line-name" title={time.name}>
                      /{time.name}
                    </span>
                  </div>
                ) : null}
              </span>
            </div>
          ))}
      </div>
    </div>
  </div>
);

TimetableRow.propTypes = {
  title: PropTypes.string.isRequired,
  stoptimes: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      serviceDay: PropTypes.number.isRequired,
      scheduledDeparture: PropTypes.number.isRequired,
    }),
  ).isRequired,
  showRoutes: PropTypes.array,
  timerows: PropTypes.array,
};

export default TimetableRow;
