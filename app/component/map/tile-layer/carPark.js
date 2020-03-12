import { graphql } from 'react-relay';

export default graphql`
  query carParkQuery($id: String!) {
    carPark(id: $id) {
      id
      name
      maxCapacity
      spacesAvailable
      realtime
    }
  }
`;
