import PropTypes from 'prop-types';
import React from 'react';

// lower `sortNumber` first, `null` last
const sortOpeningHours = (oH1, oH2) => {
  const { sortNumber: sN1 } = oH1;
  const { sortNumber: sN2 } = oH2;
  if (Number.isInteger(sN1) && Number.isInteger(sN2)) {
    return sN1 - sN2;
  }
  if (!Number.isInteger(sN1) && !Number.isInteger(sN2)) {
    return 0;
  }
  if (!Number.isInteger(sN1)) {
    return 1;
  }
  return -1;
};

const OpeningHours = ({ openingHours }) => {
  if (!openingHours?.length) {
    return null;
  }

  const sortedOpeningHours = openingHours.slice().sort(sortOpeningHours);

  return sortedOpeningHours.map(item => {
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
