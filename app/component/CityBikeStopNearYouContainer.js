import { graphql, createRefetchContainer } from 'react-relay';
import CityBikeStopNearYou from './CityBikeStopNearYou.okc';

const containerComponent = createRefetchContainer(
  CityBikeStopNearYou,
  {
    stop: graphql`
      fragment CityBikeStopNearYouContainer_stop on BikeRentalStation {
        stationId
        name
        bikesAvailable
        spacesAvailable
        capacity
        networks
        state
      }
    `,
  },
  graphql`
    query CityBikeStopNearYouContainerRefetchQuery($stopId: String!) {
      bikeRentalStation(id: $stopId) {
        ...CityBikeStopNearYouContainer_stop
      }
    }
  `,
);

export default containerComponent;
