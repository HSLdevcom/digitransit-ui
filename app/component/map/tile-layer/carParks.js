import { graphql } from 'react-relay';

export default graphql`
  query carParksQuery($ids: [String!]!) {
    carParks(ids: $ids) {
      id
      carParkId
      name
      maxCapacity
      spacesAvailable
      realtime
    }
  }
`;
