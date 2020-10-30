import React from 'react';
import { v4 as uuid } from 'uuid';
import PropTypes from 'prop-types';
import DepartureRow from './DepartureRow';

const StopNearYouDepartureRowContainer = ({ stopTimes, ...props }) => {
  const departures = stopTimes.map(row => {
    const departureTime = row.serviceDay + row.realtimeArrival;
    return (
      <DepartureRow
        key={uuid()}
        departure={row}
        departureTime={departureTime}
        currentTime={props.currentTime}
        showPlatformCode={props.isStation}
      />
    );
  });

  return (
    <div role="list" className="near-departures-container">
      {departures}
    </div>
  );
};

StopNearYouDepartureRowContainer.propTypes = {
  stopTimes: PropTypes.arrayOf(
    PropTypes.shape({
      distance: PropTypes.number,
    }),
  ),
  isStation: PropTypes.bool.isRequired,
  currentTime: PropTypes.number.isRequired,
};
export default StopNearYouDepartureRowContainer;
