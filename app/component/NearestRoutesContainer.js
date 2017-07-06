import { gql, graphql } from 'react-apollo';
import PlaceAtDistanceListContainer, {
  placeAtDistanceListContainerFragment,
} from './PlaceAtDistanceListContainer';

const NearbyRouteListContainerQuery = gql`
  query NearbyRouteListContainerQuery(
      $lat: Float!,
      $lon: Float!,
      $currentTime: Long!,
      $modes: [Mode!],
      $placeTypes: [FilterPlaceType!],
      $maxDistance: Int!,
      $maxResults: Int!,
      $timeRange: Int!
    ) {
      places: nearest(
        lat: $lat,
        lon: $lon,
        maxDistance: $maxDistance,
        maxResults: $maxResults,
        first: $maxResults,
        filterByModes: $modes,
        filterByPlaceTypes: $placeTypes,
      ) {
        ...placeAtDistanceList
      }
    }
    ${placeAtDistanceListContainerFragment}
`;

export default graphql(NearbyRouteListContainerQuery, {
  options: props => ({
    variables: {
      lat: props.lat,
      lon: props.lon,
      currentTime: props.currentTime,
      modes: props.modes,
      placeTypes: props.placeTypes,
      maxDistance: props.maxDistance,
      maxResults: props.maxResults,
      timeRange: props.timeRange,
    },
  }),
})(PlaceAtDistanceListContainer);
