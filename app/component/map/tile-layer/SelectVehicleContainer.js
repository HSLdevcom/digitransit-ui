import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { graphql, QueryRenderer, ReactRelayContext } from 'react-relay';
import TripMarkerPopup from '../route/TripMarkerPopup';
import SelectVehicleRow from './SelectVehicleRow';
import Loading from '../../Loading';
import ComponentUsageExample from '../../ComponentUsageExample';

const rowQuery = graphql`
  query SelectVehicleContainerQuery(
    $route: String!
    $direction: Int!
    $time: Int!
    $date: String!
  ) {
    route: route(id: $route) {
      ...SelectVehicleRow_route
    }
    trip: fuzzyTrip(
      route: $route
      direction: $direction
      time: $time
      date: $date
    ) {
      ...SelectVehicleRow_trip
    }
  }
`;

const query = graphql`
  query SelectVehicleContainerFuzzyQuery(
    $route: String!
    $direction: Int!
    $time: Int!
    $date: String!
  ) {
    route: route(id: $route) {
      ...TripMarkerPopup_route
    }
    trip: fuzzyTrip(
      route: $route
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
  const graphqlQuery = props.rowView ? rowQuery : query;
  if (!props.vehicle) {
    return null;
  }
  return (
    <QueryRenderer
      query={graphqlQuery}
      variables={{
        route: props.vehicle.route,
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

SelectVehicleContainer.description = () => (
  <div>
    <p>Renders a select stop row</p>
    <ComponentUsageExample description="">
      <SelectVehicleRow
        gtfsId="TEST"
        type="BUS"
        name="Testipysäkki"
        code="X0000"
        desc="Testikatu"
      />
    </ComponentUsageExample>
  </div>
);

SelectVehicleContainer.propTypes = {
  rowView: PropTypes.bool,
  vehicle: PropTypes.object.isRequired,
};

SelectVehicleContainer.defaultProps = {
  rowView: false,
};

export default SelectVehicleContainer;
