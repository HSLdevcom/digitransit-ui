import { graphql } from 'react-relay';

export default graphql`
  query bikeParksQuery($ids: [String!]!) {
    bikeParks(ids: $ids) {
      id
      name
      spacesAvailable
      realtime
    }
  }
`;
