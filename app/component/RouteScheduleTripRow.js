import PropTypes from 'prop-types';
import React from 'react';
import ComponentUsageExample from './ComponentUsageExample';

function RouteScheduleTripRow(props) {
  return (
    <div className="row">
      <div className="trip-column">
        <div className="trip-from trip-label">
          {props.departureTime}
        </div>
        <div className="trip-separator" />
        <div className="trip-to trip-label">
          {props.arrivalTime}
        </div>
      </div>
    </div>
  );
}
RouteScheduleTripRow.propTypes = {
  departureTime: PropTypes.string.isRequired,
  arrivalTime: PropTypes.string.isRequired,
};

RouteScheduleTripRow.displayName = 'RouteScheduleTripRow';

RouteScheduleTripRow.description = () =>
  <div>
    <p>Display a route schedule row using react components</p>
    <ComponentUsageExample>
      <RouteScheduleTripRow departureTime={'08:12'} arrivalTime={'08:12'} />
    </ComponentUsageExample>
  </div>;

export default RouteScheduleTripRow;
