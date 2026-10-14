import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { graphql, QueryRenderer, ReactRelayContext } from 'react-relay';
import TripMarkerPopup from '../route/TripMarkerPopup';
import SelectVehicleRow from './SelectVehicleRow';
import { vehicleShape } from '../../../../utils/client/shapes';

const rowQuery = graphql`
  query SelectVehicleContainerRowQuery($tripId: String!) {
    trip: trip(id: $tripId) {
      ...SelectVehicleRow_trip
    }
  }
`;

const query = graphql`
  query SelectVehicleContainerQuery($tripId: String!) {
    trip: trip(id: $tripId) {
      ...TripMarkerPopup_trip
    }
  }
`;

const fuzzyRowQuery = graphql`
  query SelectVehicleContainerFuzzyRowQuery(
    $routeId: String!
    $direction: Int!
    $time: Int!
    $date: String!
  ) {
    trip: fuzzyTrip(
      route: $routeId
      direction: $direction
      time: $time
      date: $date
    ) {
      ...SelectVehicleRow_trip
    }
  }
`;

const fuzzyQuery = graphql`
  query SelectVehicleContainerFuzzyQuery(
    $routeId: String!
    $direction: Int!
    $time: Int!
    $date: String!
  ) {
    trip: fuzzyTrip(
      route: $routeId
      direction: $direction
      time: $time
      date: $date
    ) {
      ...TripMarkerPopup_trip
    }
  }
`;

function SelectVehicleContainer({ rowView = false, vehicle }) {
  const { environment } = useContext(ReactRelayContext);
  if (!vehicle) {
    return null;
  }
  return vehicle.tripId ? (
    <QueryRenderer
      query={rowView ? rowQuery : query}
      variables={{
        tripId: vehicle.tripId,
      }}
      environment={environment}
      render={results => {
        if (results.props?.trip) {
          const content = rowView ? (
            <SelectVehicleRow {...results.props} message={vehicle} />
          ) : (
            <TripMarkerPopup {...results.props} message={vehicle} />
          );
          return content;
        }
        return null;
      }}
    />
  ) : (
    <QueryRenderer
      query={rowView ? fuzzyRowQuery : fuzzyQuery}
      variables={{
        routeId: vehicle.route,
        direction: vehicle.direction,
        date: vehicle.operatingDay,
        time:
          vehicle.tripStartTime.substring(0, 2) * 60 * 60 +
          vehicle.tripStartTime.substring(2, 4) * 60,
      }}
      environment={environment}
      render={results => {
        if (results.props?.trip) {
          const content = rowView ? (
            <SelectVehicleRow {...results.props} message={vehicle} />
          ) : (
            <TripMarkerPopup {...results.props} message={vehicle} />
          );
          return content;
        }
        return null;
      }}
    />
  );
}

SelectVehicleContainer.displayName = 'SelectVehicleContainer';

SelectVehicleContainer.propTypes = {
  rowView: PropTypes.bool,
  vehicle: vehicleShape.isRequired,
};

export default SelectVehicleContainer;
