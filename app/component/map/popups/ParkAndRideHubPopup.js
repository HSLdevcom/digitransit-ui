import Relay from 'react-relay';
import ParkAndRidePopup from './ParkAndRidePopup';
import withProps from 'recompose/withProps';

export default Relay.createContainer(withProps(props => ({
  realtime:
    props.facilities.reduce((prev, current) => prev && (!current || current.realtime), true),
  maxCapacity:
    props.facilities.reduce((prev, current) => prev + (current ? current.maxCapacity : 0), 0),
  spacesAvailable:
    props.facilities.reduce((prev, current) => prev + (current ? current.spacesAvailable : 0), 0),
}))(ParkAndRidePopup), {
  fragments: {
    facilities: () => Relay.QL`
      fragment on CarPark @relay(plural:true) {
        spacesAvailable
        maxCapacity
        realtime
      }
    `,
  },
});
