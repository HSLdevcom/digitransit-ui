import Relay from 'react-relay';
import ParkAndRidePopup from './ParkAndRidePopup';

export default Relay.createContainer(ParkAndRidePopup, {
  fragments: {
    facility: () => Relay.QL`
      fragment on CarPark {
        carParkId
        name
        lat
        lon
        spacesAvailable
        maxCapacity
      }
    `,
  },
});
