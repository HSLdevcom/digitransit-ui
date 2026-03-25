import { createFragmentContainer, graphql } from 'react-relay';
import ParkAndRideContent from './ParkAndRideContent';

const containerComponent = createFragmentContainer(ParkAndRideContent, {
  vehicleParking: graphql`
    fragment ParkContainer_vehicleParking on VehicleParking {
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
      name
      lat
      lon
      tags
      realtime
      wheelchairAccessibleCarPlaces
    }
  `,
});

export { containerComponent as default, ParkAndRideContent as Component };
