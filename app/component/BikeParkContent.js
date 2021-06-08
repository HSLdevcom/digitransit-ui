import { createFragmentContainer, graphql } from 'react-relay';
import ParkAndRideContent from './ParkAndRideContent';

const containerComponent = createFragmentContainer(ParkAndRideContent, {
  bikePark: graphql`
    fragment BikeParkContent_bikePark on BikePark {
      bikeParkId
      spacesAvailable
      name
      lat
      lon
      tags
    }
  `,
});

export { containerComponent as default, ParkAndRideContent as Component };
