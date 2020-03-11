import { graphql } from 'react-relay';

export default graphql`
  query favouriteStationsQuery($ids: [String!]!) {
    stations(ids: $ids) {
      gtfsId
      lat
      lon
      name
    }
  }
`;
