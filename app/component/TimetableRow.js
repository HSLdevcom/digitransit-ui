import React, { PropTypes } from 'react';
import moment from 'moment';
import cx from 'classnames';

const LONG_LINE_NAME = 5;

const TimetableRow = ({ title, stoptimes, showRoutes, hideAllRoutes }) => (
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
            {(showRoutes.filter(o => o === time.name).length > 0
            && showRoutes.length > 0 && hideAllRoutes === false)
            || (showRoutes.length === 0 && hideAllRoutes === false) ?
              <div>
                <span className="bold">{moment.unix(time.serviceDay + time.scheduledDeparture).format('mm')}</span>
                <span className="line-name" title={(time.name)}>/{(time.name)}</span>
              </div>
            : null
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
  showRoutes: PropTypes.array,
  hideAllRoutes: PropTypes.bool,
};

export default TimetableRow;
