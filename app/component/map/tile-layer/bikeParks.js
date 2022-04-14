import { graphql } from 'react-relay';

export default graphql`
  query bikeParksQuery($ids: [String!]!) {
    bikeParks(ids: $ids) {
      id
      bikeParkId
      name
      spacesAvailable
      realtime
    }
  }
`;
