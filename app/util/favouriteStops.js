import { graphql } from 'react-relay/compat';

export default graphql`
  query favouriteStopsQuery($ids: [String!]!) {
    stops(ids: $ids) {
      gtfsId
      lat
      lon
      name
      desc
      code
      routes {
        mode
      }
    }
  }
`;
