import { graphql } from 'react-relay';

export default graphql`
  query carParksQuery($ids: [String!]!) {
    carParks(ids: $ids) {
      id
      name
      maxCapacity
      spacesAvailable
      realtime
    }
  }
`;
