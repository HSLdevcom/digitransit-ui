import { createFragmentContainer, graphql } from 'react-relay';
import ParkAndRideContent from './ParkAndRideContent';

const containerComponent = createFragmentContainer(ParkAndRideContent, {
  park: graphql`
    fragment VehicleParkContent_vehicleParking on VehicleParking
    @argumentDefinitions(dates: { type: "[String!]!" }) {
      vehicleParkingId
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
      openingHours {
        dates(dates: $dates) {
          date
          timeSpans {
            from
            to
          }
        }
      }
    }
  `,
});

export { containerComponent as default, ParkAndRideContent as Component };
