import React from 'react';
import PropTypes from 'prop-types';

const CancelledDepartures = ({ departures }) => (
  <div className="badges__departure-group">
    {departures.map(({ tripId, departureTime }) => (
      <span
        key={`${tripId}-${departureTime}`}
        className="badges__departure-time"
      >
        <span className="routes-s-narrow">{departureTime}</span>
      </span>
    ))}
  </div>
);

CancelledDepartures.propTypes = {
  departures: PropTypes.arrayOf(
    PropTypes.shape({
      tripId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      departureTime: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default CancelledDepartures;
