import React, { PropTypes } from 'react';

function RouteScheduleTripRow(props) {
  return (
    <div className="row">
      <div className="trip-column">
        <div className="trip-from trip-label left">{props.departureTime}</div>
        <div className="trip-separator"></div>
        <div className="trip-to trip-label right text-right">{props.arrivalTime}</div>
      </div>
    </div>);
}
RouteScheduleTripRow.propTypes = {
  departureTime: PropTypes.string.isRequired,
  arrivalTime: PropTypes.string.isRequired,
};

export default RouteScheduleTripRow;
