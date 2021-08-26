import { createFragmentContainer, graphql } from 'react-relay';
import ParkAndRideContent from './ParkAndRideContent';

const containerComponent = createFragmentContainer(ParkAndRideContent, {
  carPark: graphql`
    fragment CarParkContent_carPark on CarPark {
      carParkId
      spacesAvailable
      name
      lat
      lon
      tags
    }
  `,
});

export { containerComponent as default, ParkAndRideContent as Component };
