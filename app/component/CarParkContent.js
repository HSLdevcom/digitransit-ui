import { createFragmentContainer, graphql } from 'react-relay';
import ParkAndRideContent from './ParkAndRideContent';

const containerComponent = createFragmentContainer(ParkAndRideContent, {
  carPark: graphql`
    fragment CarParkContent_carPark on CarPark
    @argumentDefinitions(dates: { type: "[String!]!" }) {
      carParkId
      spacesAvailable
      name
      lat
      lon
      tags
      realtime
      maxCapacity
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
