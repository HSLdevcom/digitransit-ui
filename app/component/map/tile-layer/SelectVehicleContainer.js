import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { graphql, QueryRenderer, ReactRelayContext } from 'react-relay';
import TripMarkerPopup from '../route/TripMarkerPopup';
import SelectVehicleRow from './SelectVehicleRow';
import Loading from '../../Loading';

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

function SelectVehicleContainer(props) {
  const { environment } = useContext(ReactRelayContext);
  if (!props.vehicle) {
    return null;
  }
  return props.vehicle.tripId ? (
    <QueryRenderer
      query={props.rowView ? rowQuery : query}
      variables={{
        tripId: props.vehicle.tripId,
      }}
      environment={environment}
      render={results => {
        if (results.props) {
          const content = props.rowView ? (
            <SelectVehicleRow {...results.props} message={props.vehicle} />
          ) : (
            <TripMarkerPopup {...results.props} message={props.vehicle} />
          );
          return content;
        }

        return (
          <div className="card" style={{ height: '12rem' }}>
            <Loading />
          </div>
        );
      }}
    />
  ) : (
    <QueryRenderer
      query={props.rowView ? fuzzyRowQuery : fuzzyQuery}
      variables={{
        routeId: props.vehicle.route,
        direction: props.vehicle.direction,
        date: props.vehicle.operatingDay,
        time:
          props.vehicle.tripStartTime.substring(0, 2) * 60 * 60 +
          props.vehicle.tripStartTime.substring(2, 4) * 60,
      }}
      environment={environment}
      render={results => {
        if (results.props) {
          const content = props.rowView ? (
            <SelectVehicleRow {...results.props} message={props.vehicle} />
          ) : (
            <TripMarkerPopup {...results.props} message={props.vehicle} />
          );
          return content;
        }

        return (
          <div className="card" style={{ height: '12rem' }}>
            <Loading />
          </div>
        );
      }}
    />
  );
}

SelectVehicleContainer.displayName = 'SelectVehicleContainer';

SelectVehicleContainer.propTypes = {
  rowView: PropTypes.bool,
  vehicle: PropTypes.object.isRequired,
};

SelectVehicleContainer.defaultProps = {
  rowView: false,
};

export default SelectVehicleContainer;
