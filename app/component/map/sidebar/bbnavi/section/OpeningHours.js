import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';

const OpeningHours = ({ openingHours }) => {
  if (!openingHours?.length) {
    return null;
  }

  return openingHours.map(item => {
    const {
      id,
      dateFrom,
      dateTo,
      description,
      open,
      timeFrom,
      timeTo,
      weekday,
    } = item;

    return (
      <div key={id}>
        <div className="text-light sidebar-info-container">
          {!!weekday && <span className="opening-hours-bold">{weekday}</span>}

          {(!!dateFrom || !!dateTo || !!timeFrom || !!timeTo) && (
            <span className="text-alignment">
              {(open === undefined || open === true) &&
                (!!timeFrom || !!timeTo) && (
                  <span>
                    {!!timeFrom && <span>{timeFrom}</span>}
                    {!!timeFrom && !!timeTo && <span> -</span>}
                    {!!timeTo && <span> {timeTo}</span>}
                  </span>
                )}
              {open === false && <span>geschlossen</span>}
              {(!!dateFrom || !!dateTo) && (
                <span>
                  {!!dateFrom && (
                    <span>
                      <span small />
                      {dateFrom}
                    </span>
                  )}

                  {!!dateTo && dateTo !== dateFrom && (
                    <span>
                      <span small>bis </span>
                      {dateTo}
                    </span>
                  )}
                </span>
              )}
            </span>
          )}

          {!!description && <div>{description}</div>}
        </div>
      </div>
    );
  });
};

OpeningHours.propTypes = {
  openingHours: PropTypes.array.isRequired,
};

export default OpeningHours;
