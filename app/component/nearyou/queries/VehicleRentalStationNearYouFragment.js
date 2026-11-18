import { graphql } from 'react-relay';

export default graphql`
  fragment VehicleRentalStationNearYouFragment_station on VehicleRentalStation
  @refetchable(queryName: "VehicleRentalStationNearYouFragmentRefetchQuery") {
    stationId
    name
    availableVehicles {
      total
    }
    availableSpaces {
      total
    }
    capacity
    rentalNetwork {
      networkId
    }
    operative
  }
`;
