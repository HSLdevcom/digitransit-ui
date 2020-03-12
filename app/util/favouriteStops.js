import { graphql } from 'react-relay';

export default graphql`
  query favouriteStopsQuery($ids: [String!]!) {
    stops(ids: $ids) {
      gtfsId
      lat
      lon
      name
      code
    }
  }
`;
