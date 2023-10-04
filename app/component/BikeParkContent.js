import { createFragmentContainer, graphql } from 'react-relay';
import ParkAndRideContent from './ParkAndRideContent';

const containerComponent = createFragmentContainer(ParkAndRideContent, {
  bikePark: graphql`
    fragment BikeParkContent_bikePark on BikePark
    @argumentDefinitions(dates: { type: "[String!]!" }) {
      bikeParkId
      spacesAvailable
      name
      lat
      lon
      tags
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
