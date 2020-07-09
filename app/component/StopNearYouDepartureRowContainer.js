import React from 'react';
import PropTypes from 'prop-types';
import DepartureRow from './DepartureRow';

const StopNearYouDepartureRowContainer = ({ stopTimes, ...props }) => {
  const departures = stopTimes.map(row => {
    const departureTime = row.serviceDay + row.realtimeArrival;
    return (
      <DepartureRow
        key={`${row.trip.route.gtfsId}_${row.realtimeArrival}`}
        departure={row}
        departureTime={departureTime}
        currentTime={props.currentTime}
      />
    );
  });

  return <div className="near-departures-container">{departures}</div>;
};

DepartureRow.propTypes = {
  departure: PropTypes.object.isRequired,
};
StopNearYouDepartureRowContainer.propTypes = {
  stopTimes: PropTypes.arrayOf(
    PropTypes.shape({
      distance: PropTypes.number,
    }),
  ),
  currentTime: PropTypes.number.isRequired,
};
export default StopNearYouDepartureRowContainer;
