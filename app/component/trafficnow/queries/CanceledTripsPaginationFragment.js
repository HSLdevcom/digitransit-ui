import { graphql } from 'react-relay';
import './CanceledTripNodeFieldsFragment';

export default graphql`
  fragment CanceledTripsPaginationFragment on QueryType
  @refetchable(queryName: "CanceledTripsPaginationQuery") {
    canceledTrips(
      first: $first
      after: $after
      filters: { include: { modes: [$mode] } }
    ) @connection(key: "CanceledTripsPagination__canceledTrips") {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          ...CanceledTripNodeFieldsFragment @relay(mask: false)
        }
      }
    }
  }
`;
