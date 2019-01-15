import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';

const TimetableRow = ({ title, stoptimes, showRoutes, timerows }) => (
  <div
    className="timetable-row"
    style={{
      display:
        timerows.filter(o => o === title).length === 0 && showRoutes.length > 0
          ? 'none'
          : undefined,
    }}
  >
    <h1 className="title bold">{title}:</h1>
    <div className="timetable-printable-title">{title}</div>
    <div className="timetable-rowcontainer">
      {stoptimes
        .filter(
          time =>
            (showRoutes.filter(o => o === time.id).length > 0 &&
              showRoutes.length > 0) ||
            showRoutes.length === 0,
        )
        .sort(
          (time1, time2) => time1.scheduledDeparture - time2.scheduledDeparture,
        )
        .map(time => (
          <div
            className={cx('timetablerow-linetime', {
              canceled: time.isCanceled,
            })}
            key={`${time.id}-${time.name}-${time.scheduledDeparture}`}
          >
            <span>
              <div>
                <span className="bold">
                  {moment
                    .unix(time.serviceDay + time.scheduledDeparture)
                    .format('mm')}
                </span>
                <span className="line-name" title={time.name}>
                  /{time.name}
                  {time.duplicate}
                </span>
              </div>
            </span>
          </div>
        ))}
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
  showRoutes: PropTypes.arrayOf(PropTypes.string),
  timerows: PropTypes.arrayOf(PropTypes.string),
};

TimetableRow.defaultProps = {
  showRoutes: [],
  timerows: [],
};

export default TimetableRow;
