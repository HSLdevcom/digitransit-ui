import { graphql } from 'react-relay';

export default graphql`
  fragment ParkNearYouFragment_park on VehicleParking
  @refetchable(queryName: "ParkNearYouFragmentRefetchQuery") {
    ...ParkAndRideContent_vehicleParking
    vehicleParkingId
    name
    lat
    lon
    availability {
      carSpaces
    }
    parkCapacity: capacity {
      bicycleSpaces
      carSpaces
    }
    openingHours {
      osm
    }
    tags
    realtime
  }
`;
