import { createFragmentContainer, graphql } from 'react-relay';
import ParkAndRideContent from './ParkAndRideContent';

const containerComponent = createFragmentContainer(ParkAndRideContent, {
  vehicleParking: graphql`
    fragment ParkContainer_vehicleParking on VehicleParking {
      availability {
        bicycleSpaces
        carSpaces
      }
      capacity {
        carSpaces
      }
      name
      lat
      lon
      tags
      realtime
    }
  `,
});

export { containerComponent as default, ParkAndRideContent as Component };
