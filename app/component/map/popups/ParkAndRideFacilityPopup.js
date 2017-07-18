import Relay from 'react-relay';
import withProps from 'recompose/withProps';
import ParkAndRidePopup from './ParkAndRidePopup';

export default Relay.createContainer(
  withProps(props => ({
    realtime: props.facility.realtime,
    maxCapacity: props.facility.maxCapacity,
    spacesAvailable: props.facility.spacesAvailable,
  }))(ParkAndRidePopup),
  {
    fragments: {
      facility: () => Relay.QL`
      fragment on CarPark {
        spacesAvailable
        maxCapacity
        realtime
      }
    `,
    },
  },
);
