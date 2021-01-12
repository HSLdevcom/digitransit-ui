import { createFragmentContainer, graphql } from 'react-relay';
import withProps from 'recompose/withProps';
import ParkAndRidePopup from './ParkAndRidePopup';

export default createFragmentContainer(
  withProps(props => ({
    realtime: props.facility.realtime,
    maxCapacity: props.facility.maxCapacity,
    spacesAvailable: props.facility.spacesAvailable,
    locationPopup: props.locationPopup,
    onSelectLocation: props.onSelectLocation,
  }))(ParkAndRidePopup),
  {
    facility: graphql`
      fragment ParkAndRideFacilityPopup_facility on CarPark {
        spacesAvailable
        maxCapacity
        realtime
      }
    `,
  },
);
