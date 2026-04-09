import { graphql } from 'react-relay';
import './CanceledTripsPaginationFragment';

export default graphql`
  query CanceledTripsForModeQuery(
    $first: Int!
    $after: String
    $mode: TransitMode!
  ) {
    ...CanceledTripsPaginationFragment
  }
`;
