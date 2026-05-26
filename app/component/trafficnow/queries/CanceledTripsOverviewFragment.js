import { graphql } from 'react-relay';
import './CanceledTripNodeFieldsFragment';

export default graphql`
  fragment CanceledTripsOverviewFragment on TripOnServiceDateConnection {
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
`;
